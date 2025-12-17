import React from "react";
import type { Blog } from "./BlogCard";
import BlogCard from "./BlogCard";

interface BlogListProps {
  blogs: Blog[];
  currentPage?: number;
  itemsPerPage?: number;
}

const BlogList: React.FC<BlogListProps> = ({
  blogs,
  currentPage = 1,
  itemsPerPage = 10,
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBlogs = blogs.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {paginatedBlogs.map((blog) => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
    </div>
  );
};

export default BlogList;
