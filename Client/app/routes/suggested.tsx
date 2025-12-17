import MainLayout from "../layout/MainLayout";
import BlogList from "../components/Blogs/BlogList";
import suggestedBlogs from "../data/suggestedBlogs";
import Pagination from "../components/Pagination";
import { useSearchParams } from "react-router";

export function meta({}: any) {
  return [
    { title: "JobsViet - Việc gợi ý" },
    {
      name: "description",
      content: "Các việc làm được gợi ý dành cho bạn trên JobsViet!",
    },
  ];
}

export default function Suggested() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = 10;

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Việc gợi ý</h1>
        <BlogList
          blogs={suggestedBlogs}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
        />
        <Pagination
          totalItems={suggestedBlogs.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </MainLayout>
  );
}
