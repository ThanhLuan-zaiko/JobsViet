import type { Route } from "./+types/home";
import MainLayout from "../layout/MainLayout";
import JobList from "../components/Jobs/JobList";
import { fetchJobs, type Job } from "../data/mockJobs";
import Pagination from "../components/Pagination";
import { useSearchParams } from "react-router";
import { useState, useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "JobsViet - Find Your Dream Job" },
    {
      name: "description",
      content: "Welcome to JobsViet, your platform for job searching!",
    },
  ];
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = 10;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const { jobs: fetchedJobs, totalCount: fetchedTotalCount } =
          await fetchJobs(currentPage, itemsPerPage);
        setJobs(fetchedJobs);
        setTotalCount(fetchedTotalCount);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Việc làm nổi bật
          </h1>
          <div className="text-center">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Việc làm nổi bật
          </h1>
          <div className="text-center text-red-500">Error: {error}</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Việc làm nổi bật
        </h1>
        <JobList jobs={jobs} />
        <Pagination
          totalItems={totalCount}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </MainLayout>
  );
}
