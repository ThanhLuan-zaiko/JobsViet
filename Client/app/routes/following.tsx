import MainLayout from "../layout/MainLayout";
import CompanyList from "../components/Companies/CompanyList";
import followedCompanies from "../data/followedCompanies";
import Pagination from "../components/Pagination";
import { useSearchParams } from "react-router";

export function meta({}: any) {
  return [
    { title: "JobsViet - Công ty theo dõi" },
    {
      name: "description",
      content: "Danh sách các công ty bạn đang theo dõi trên JobsViet!",
    },
  ];
}

export default function Following() {
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
          Công ty theo dõi
        </h1>
        <CompanyList
          companies={followedCompanies}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
        />
        <Pagination
          totalItems={followedCompanies.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </MainLayout>
  );
}
