import MainLayout from "../layout/MainLayout";
import JobList from "../components/Jobs/JobList";
import hotJobs from "../data/hotJobs";
import Pagination from "../components/Pagination";
import { useSearchParams } from "react-router";

export function meta({}: any) {
  return [
    { title: "JobsViet - Trending Jobs" },
    {
      name: "description",
      content: "Discover the most trending job opportunities on JobsViet!",
    },
  ];
}

export default function Trending() {
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
          Việc làm thịnh hành
        </h1>
        <JobList
          jobs={hotJobs}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
        />
        <Pagination
          totalItems={hotJobs.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </MainLayout>
  );
}
