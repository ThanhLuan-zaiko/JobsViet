import React from "react";
import type { Company } from "./CompanyCard";
import CompanyCard from "./CompanyCard";

interface CompanyListProps {
  companies: Company[];
  currentPage?: number;
  itemsPerPage?: number;
}

const CompanyList: React.FC<CompanyListProps> = ({
  companies,
  currentPage = 1,
  itemsPerPage = 10,
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCompanies = companies.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {paginatedCompanies.map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </div>
  );
};

export default CompanyList;
