import MainLayout from "../layout/MainLayout";
import BlogList from "../components/Blogs/BlogList";
import Pagination from "../components/Pagination";
import { useSearchParams, Link } from "react-router";
import { useEffect, useState, useCallback } from "react";
import { blogService } from "../services/blogService";
import type { Blog } from "../types/blog";
import { FaPenNib } from "react-icons/fa6";

export function meta({ }: any) {
  return [
    { title: "JobsViet - Chia sẻ kinh nghiệm" },
    {
      name: "description",
      content: "Các bài viết chia sẻ kinh nghiệm và kiến thức bổ ích trên JobsViet!",
    },
  ];
}

export default function Suggested() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 9; // Grid layout looks better with multiples of 3

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, total } = await blogService.getAll(currentPage, itemsPerPage);
      setBlogs(data);
      setTotalCount(total);
    } catch (error) {
      console.error("Failed to fetch blogs", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Blog & Chia sẻ</h1>
              <p className="text-gray-600">Khám phá những kiến thức và kinh nghiệm nghề nghiệp bổ ích</p>
            </div>

            <Link to="/blogs/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center">
              <FaPenNib className="w-4 h-4 mr-2" />
              Viết bài
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-96 animate-pulse shadow-sm p-4">
                  <div className="bg-gray-200 h-48 w-full rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <BlogList blogs={blogs} onDelete={fetchBlogs} />

              <div className="mt-12 flex justify-center">
                <Pagination
                  totalItems={totalCount || blogs.length * 2} // Temporary fallback until service is updated
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
