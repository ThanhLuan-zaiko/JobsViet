import React, { useState } from "react";
import { FaArrowRight, FaPen, FaTrash } from "react-icons/fa";
import { Link } from "react-router";
import type { Blog } from "../../types/blog";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useAuth } from "../../contexts/AuthContext";
import { blogService } from "../../services/blogService";
import ConfirmationModal from "../Common/ConfirmationModal";

interface BlogCardProps {
  blog: Blog;
  onDelete?: () => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog, onDelete }) => {
  const { user, setNotification } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const primaryImage = blog.images.find((img) => img.isPrimary) || blog.images[0];
  const imageUrl = primaryImage
    ? `${import.meta.env.VITE_IMAGES_SERVICE || ""}${primaryImage.filePath}`
    : "https://via.placeholder.com/600x400?text=No+Image";

  const isAuthor = user?.userId === blog.authorUserId;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await blogService.delete(blog.blogId);
      setNotification({ message: "Đã xóa bài viết", type: "success" });
      setShowDeleteModal(false);
      if (onDelete) onDelete();
    } catch (error) {
      console.error("Failed to delete blog", error);
      setNotification({ message: "Không thể xóa bài viết", type: "error" });
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 border border-gray-100 relative"
      >
        {/* Full card link overlay */}
        <Link
          to={`/blogs/${blog.blogId}`}
          className="absolute inset-0 z-0"
          aria-label={`View details for ${blog.title}`}
        />

        {/* Author Actions */}
        {isAuthor && (
          <div className="absolute top-2 right-2 flex gap-2 z-20">
            <Link
              to={`/blogs/${blog.blogId}/edit`}
              className="p-2 bg-white/90 text-blue-600 rounded-full hover:bg-blue-500 hover:text-white transition-colors shadow-sm"
              title="Sửa bài viết"
            >
              <FaPen size={14} />
            </Link>
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="p-2 bg-white/90 text-red-600 rounded-full hover:bg-red-500 hover:text-white transition-colors shadow-sm"
              title="Xóa bài viết"
            >
              <FaTrash size={14} />
            </button>
          </div>
        )}

        <div className="relative h-48 sm:h-56 overflow-hidden z-0">
          <img
            src={imageUrl}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-5 relative z-10 pointer-events-none">
          <div className="flex items-center space-x-2 mb-3">
            {blog.authorAvatar ? (
              <img
                src={blog.authorAvatar}
                alt={blog.authorName}
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                {blog.authorName?.charAt(0) || "U"}
              </div>
            )}
            <div className="text-xs text-gray-500 font-medium">
              <span className="text-gray-900">{blog.authorName}</span>
              <span className="mx-1">•</span>
              {format(new Date(blog.createdAt), "d MMMM, yyyy", { locale: vi })}
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {blog.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
            {blog.content.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").substring(0, 150)}...
          </p>
          <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
            Đọc tiếp
            <FaArrowRight className="w-4 h-4 ml-1" />
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
    </>
  );
};

export default BlogCard;
