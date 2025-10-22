import MainLayout from "../layout/MainLayout";
import ManageJobList from "../components/Jobs/ManageJobList";
import postedJobs from "../data/postedJobs";
import Pagination from "../components/Pagination";
import { useSearchParams } from "react-router";

export function meta({}: any) {
  return [
    { title: "JobsViet - Quản lý tin đăng" },
    {
      name: "description",
      content: "Quản lý các tin tuyển dụng đã đăng trên JobsViet!",
    },
  ];
}

export default function ManageJobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = 10;

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  const handleEdit = (id: string) => {
    alert(`Chỉnh sửa tin đăng với ID: ${id}`);
    // Here you would navigate to an edit page or open a modal
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tin đăng này?")) {
      alert(`Đã xóa tin đăng với ID: ${id}`);
      // Here you would call an API to delete the job
    }
  };

  const handleToggleStatus = (id: string) => {
    alert(`Đã thay đổi trạng thái tin đăng với ID: ${id}`);
    // Here you would call an API to toggle the status
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Quản lý tin đăng
        </h1>
        <ManageJobList
          jobs={postedJobs}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
        <Pagination
          totalItems={postedJobs.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </MainLayout>
  );
}
