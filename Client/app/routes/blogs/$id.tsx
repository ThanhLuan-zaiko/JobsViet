import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import MainLayout from "../../layout/MainLayout";
import { blogService } from "../../services/blogService";
import type { Blog } from "../../types/blog";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { FaArrowLeft, FaPen, FaTrash } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import ConfirmationModal from "../../components/Common/ConfirmationModal";

export default function BlogDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, setNotification } = useAuth();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchBlog = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await blogService.getById(id);
                setBlog(data);
            } catch (err) {
                console.error("Failed to fetch blog", err);
                setError("Không thể tải bài viết. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [id]);

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!blog || !id) return;
        setIsDeleting(true);

        try {
            await blogService.delete(id);
            setNotification({ message: "Đã xóa bài viết thành công", type: "success" });
            setShowDeleteModal(false);
            navigate("/suggested");
        } catch (err) {
            console.error("Failed to delete blog", err);
            setNotification({ message: "Không thể xóa bài viết. Vui lòng thử lại.", type: "error" });
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <div className="animate-pulse space-y-4">
                        <div className="h-64 bg-gray-200 rounded-xl w-full"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="space-y-2 pt-4">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (error || !blog) {
        return (
            <MainLayout>
                <div className="container mx-auto px-4 py-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        {error || "Bài viết không tồn tại"}
                    </h2>
                    <Link to="/suggested" className="text-blue-600 hover:underline">
                        &larr; Quay lại danh sách bài viết
                    </Link>
                </div>
            </MainLayout>
        );
    }

    const primaryImage = blog.images.find((img) => img.isPrimary) || blog.images[0];
    const imageUrl = primaryImage
        ? `${import.meta.env.VITE_IMAGES_SERVICE || ""}${primaryImage.filePath}`
        : "https://via.placeholder.com/800x400?text=No+Image";

    const isAuthor = user?.userId === blog.authorUserId;

    return (
        <MainLayout>
            <div className="bg-white min-h-screen pb-12">
                {/* Hero Section with Image */}
                <div className="w-full h-64 md:h-96 relative overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 container mx-auto">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-md">
                                    {blog.title}
                                </h1>
                                <div className="flex items-center text-white/90 space-x-4">
                                    <div className="flex items-center">
                                        {blog.authorAvatar ? (
                                            <img src={blog.authorAvatar} alt={blog.authorName} className="w-10 h-10 rounded-full border-2 border-white mr-3" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white border-2 border-white mr-3">
                                                {blog.authorName?.charAt(0) || "U"}
                                            </div>
                                        )}
                                        <span className="font-medium">{blog.authorName}</span>
                                    </div>
                                    <span>•</span>
                                    <span>{format(new Date(blog.createdAt), "d MMMM, yyyy", { locale: vi })}</span>
                                </div>
                            </div>

                            {isAuthor && (
                                <div className="flex gap-2">
                                    <Link
                                        to={`/blogs/${blog.blogId}/edit`}
                                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-colors"
                                    >
                                        <FaPen size={14} />
                                        <span>Sửa</span>
                                    </Link>
                                    <button
                                        onClick={handleDeleteClick}
                                        className="flex items-center gap-2 bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-colors"
                                    >
                                        <FaTrash size={14} />
                                        <span>Xóa</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <div className="bg-white rounded-xl -mt-20 relative p-8 shadow-xl">
                        <div className="prose prose-lg md:prose-xl max-w-none text-gray-800 leading-relaxed">
                            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
                            <Link to="/suggested" className="flex items-center text-gray-600 hover:text-blue-600 font-medium transition-colors">
                                <FaArrowLeft className="w-5 h-5 mr-2" />
                                Xem thêm bài viết khác
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title="Xóa bài viết"
                message="Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác."
                confirmText="Xóa bài viết"
                cancelText="Hủy"
                type="danger"
                isLoading={isDeleting}
            />
        </MainLayout>
    );
}
