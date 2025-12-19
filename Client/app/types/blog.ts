export interface BlogImage {
    blogImageId: string;
    blogId: string;
    filePath: string;
    caption?: string;
    isPrimary: boolean;
    sortOrder: number;
}

export interface Blog {
    blogId: string;
    authorUserId: string;
    authorName: string;
    authorAvatar: string;
    title: string;
    content: string;
    isPublished: boolean;
    createdAt: string;
    updatedAt?: string;
    images: BlogImage[];
}

export interface CreateBlogDto {
    title: string;
    content: string;
    isPublished?: boolean;
}

export interface UpdateBlogDto {
    title: string;
    content: string;
    isPublished: boolean;
}

export interface BlogImageCreateDto {
    filePath: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    caption?: string;
    isPrimary?: boolean;
}
