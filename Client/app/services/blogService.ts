import type { Blog, CreateBlogDto, UpdateBlogDto, BlogImageCreateDto } from "../types/blog";
import { api } from "./api"; // Assuming a central API client exists, otherwise I'll need to check where API calls are made

const BASE_URL = "/blogs";

export const blogService = {
    getAll: async (page = 1, pageSize = 10) => {
        const response = await api.get<Blog[]>(BASE_URL, {
            params: { page, pageSize },
        });
        const totalCount = parseInt(response.headers['x-total-count'] || '0', 10);
        return { data: response.data, total: totalCount };
    },

    getById: async (id: string) => {
        const response = await api.get<Blog>(`${BASE_URL}/${id}`);
        return response.data;
    },

    create: async (data: CreateBlogDto) => {
        const response = await api.post<Blog>(BASE_URL, data);
        return response.data;
    },

    update: async (id: string, data: UpdateBlogDto) => {
        const response = await api.put<Blog>(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`${BASE_URL}/${id}`);
    },

    uploadImage: async (id: string, file: File, caption?: string, isPrimary = false) => {
        const formData = new FormData();
        formData.append("file", file);

        const imageServiceUrl = import.meta.env.VITE_IMAGES_SERVICE || "http://localhost:8000";
        const uploadResponse = await fetch(`${imageServiceUrl}/upload/blog/${id}`, {
            method: 'POST',
            body: formData,
        });

        if (!uploadResponse.ok) {
            throw new Error("Failed to upload image to storage service");
        }

        const uploadResult = await uploadResponse.json();

        const dto: BlogImageCreateDto = {
            filePath: uploadResult.image_url,
            fileName: uploadResult.file_name,
            fileType: uploadResult.mime_type,
            fileSize: uploadResult.file_size,
            caption: caption,
            isPrimary: isPrimary
        };

        const response = await api.post(`${BASE_URL}/${id}/images`, dto);
        return response.data;
    },

    deleteImage: async (imageId: string) => {
        await api.delete(`${BASE_URL}/images/${imageId}`);
    }
};
