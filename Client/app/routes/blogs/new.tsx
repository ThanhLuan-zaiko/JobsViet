import { useAuth } from "../../contexts/AuthContext";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import MainLayout from "../../layout/MainLayout";
import BlogEditor from "../../components/Blogs/BlogEditor";
import { blogService } from "../../services/blogService";
import type { CreateBlogDto } from "../../types/blog";

export default function CreateBlog() {
    const navigate = useNavigate();
    const { user, setNotification } = useAuth(); // Removed loading
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        if (user) {
            setIsCheckingAuth(false);
            return;
        }

        const timer = setTimeout(() => {
            if (!user) {
                setNotification({ message: "Bạn cần đăng nhập để viết bài", type: "error" });
                navigate("/suggested");
            } else {
                setIsCheckingAuth(false);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [user, navigate, setNotification]);

    if (isCheckingAuth) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </MainLayout>
        );
    }


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                setImage(file);
                setImagePreview(URL.createObjectURL(file));
            }
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content) {
            setNotification({ message: "Vui lòng nhập tiêu đề và nội dung", type: "error" });
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const blogData: CreateBlogDto = {
                title,
                content,
                isPublished: true,
            };

            const newBlog = await blogService.create(blogData);

            if (image && newBlog.blogId) {
                await blogService.uploadImage(newBlog.blogId, image, undefined, true);
            }

            setNotification({ message: "Đăng bài viết thành công!", type: "success" });
            navigate(`/blogs/${newBlog.blogId}`);
        } catch (err) {
            console.error("Failed to create blog", err);
            setNotification({ message: "Đã có lỗi xảy ra. Vui lòng thử lại.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="bg-gray-50 min-h-screen py-12">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">Viết bài mới</h1>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tiêu đề
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Nhập tiêu đề bài viết..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ảnh bìa
                                </label>
                                <div
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer relative"
                                    onClick={() => document.getElementById('cover-image')?.click()}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                >
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="max-h-64 mx-auto rounded-lg object-contain"
                                        />
                                    ) : (
                                        <div className="space-y-2">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <p className="text-gray-500 text-sm">Nhấn để tải ảnh lên (hoặc kéo thả)</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        id="cover-image"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nội dung
                                </label>
                                <BlogEditor
                                    onChange={setContent}
                                    placeholder="Viết nội dung bài viết của bạn tại đây..."
                                />
                            </div>

                            <div className="flex justify-end pt-6">
                                <button
                                    type="button"
                                    onClick={() => navigate("/suggested")}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium mr-4 hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm
                    ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                                >
                                    {loading ? "Đang đăng..." : "Đăng bài viết"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
