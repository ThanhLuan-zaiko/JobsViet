import React from "react";

export interface Blog {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  author: string;
}

interface BlogCardProps {
  blog: Blog;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex">
      <img
        src={blog.imageUrl}
        alt={blog.title}
        className="w-1/3 object-cover"
      />
      <div className="p-4 flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {blog.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          By {blog.author} on {blog.date}
        </p>
        <p className="text-sm text-gray-700">{blog.description}</p>
      </div>
    </div>
  );
};

export default BlogCard;
