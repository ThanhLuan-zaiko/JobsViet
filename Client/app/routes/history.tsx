import MainLayout from "../layout/MainLayout";
import JobList from "../components/Jobs/JobList";
import appliedJobs from "../data/appliedJobs";
import Pagination from "../components/Pagination";
import { useSearchParams } from "react-router";

export function meta({}: any) {
  return [
    { title: "JobsViet - Application History" },
    {
      name: "description",
      content: "View your job application history on JobsViet!",
    },
  ];
}

export default function History() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = 10;

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Lịch sử ứng tuyển
        </h1>
        <JobList
          jobs={appliedJobs}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
        />
        <Pagination
          totalItems={appliedJobs.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </MainLayout>
  );
}
