import MainLayout from "../layout/MainLayout";
import ApplicantList from "../components/Applicants/ApplicantList";
import applicants from "../data/applicants";
import Pagination from "../components/Pagination";
import { useSearchParams } from "react-router";

export function meta({}: any) {
  return [
    { title: "JobsViet - Ứng viên ứng tuyển" },
    {
      name: "description",
      content: "Xem và quản lý các ứng viên đã ứng tuyển trên JobsViet!",
    },
  ];
}

export default function Applicants() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = 10;

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  const handleViewResume = (url: string) => {
    window.open(url, "_blank");
  };

  const handleUpdateStatus = (
    id: string,
    status: "pending" | "reviewed" | "accepted" | "rejected"
  ) => {
    alert(`Đã cập nhật trạng thái ứng viên ${id} thành ${status}`);
    // Here you would call an API to update the status
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Ứng viên ứng tuyển
        </h1>
        <ApplicantList
          applicants={applicants}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onViewResume={handleViewResume}
          onUpdateStatus={handleUpdateStatus}
        />
        <Pagination
          totalItems={applicants.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </MainLayout>
  );
}
