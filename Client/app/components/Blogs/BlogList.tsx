import React from "react";
import type { Blog } from "../../types/blog";
import BlogCard from "./BlogCard";

interface BlogListProps {
  blogs: Blog[];
  onDelete?: () => void;
}

const BlogList: React.FC<BlogListProps> = ({ blogs, onDelete }) => {
  if (blogs.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500 text-lg">Chưa có bài viết nào được đăng tải.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blogs.map((blog) => (
        <BlogCard key={blog.blogId} blog={blog} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default BlogList;
