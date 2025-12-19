import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import MainLayout from "../../layout/MainLayout";
import BlogEditor from "../../components/Blogs/BlogEditor";
import { useAuth } from "../../contexts/AuthContext";
import { blogService } from "../../services/blogService";
import type { UpdateBlogDto } from "../../types/blog";

export default function EditBlog() {
    const navigate = useNavigate();
    const { user, setNotification } = useAuth();
    const { id } = useParams<{ id: string }>();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setIsCheckingAuth(false);
            return;
        }

        const timer = setTimeout(() => {
            if (!user) {
                setNotification({ message: "Bạn cần đăng nhập để chỉnh sửa bài viết", type: "error" });
                navigate("/suggested");
            } else {
                setIsCheckingAuth(false);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [user, navigate, setNotification]);

    useEffect(() => {
        const fetchBlog = async () => {
            if (!id) return;
            try {
                const blog = await blogService.getById(id);
                setTitle(blog.title);
                setContent(blog.content);
            } catch (err) {
                console.error("Failed to fetch blog", err);
                setError("Không thể tải bài viết.");
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [id]);

    if (isCheckingAuth) return (
        <MainLayout>
            <div className="container mx-auto px-4 py-12 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        </MainLayout>
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !title || !content) {
            setError("Vui lòng nhập tiêu đề và nội dung bài viết");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const updateData: UpdateBlogDto = {
                title,
                content,
                isPublished: true, // Assuming keeping published or handling draft logic later
            };

            await blogService.update(id, updateData);
            navigate(`/blogs/${id}`);
        } catch (err) {
            console.error("Failed to update blog", err);
            setError("Đã có lỗi xảy ra khi cập nhật bài viết. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <MainLayout>
            <div className="container mx-auto px-4 py-12 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        </MainLayout>
    );

    return (
        <MainLayout>
            <div className="bg-gray-50 min-h-screen py-12">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">Chỉnh sửa bài viết</h1>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tiêu đề
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nội dung
                                </label>
                                <BlogEditor
                                    initialValue={content}
                                    onChange={setContent}
                                />
                            </div>

                            <div className="flex justify-end pt-6">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/blogs/${id}`)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium mr-4 hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm
                    ${saving ? "opacity-70 cursor-not-allowed" : ""}`}
                                >
                                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
