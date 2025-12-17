import React from "react";

export interface Company {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  location: string;
  industry: string;
}

interface CompanyCardProps {
  company: Company;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex">
      <img
        src={company.imageUrl}
        alt={company.name}
        className="w-1/3 object-cover"
      />
      <div className="p-4 flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {company.name}
        </h3>
        <p className="text-sm text-gray-600 mb-1">{company.location}</p>
        <p className="text-sm text-gray-500 mb-2">{company.industry}</p>
        <p className="text-sm text-gray-700">{company.description}</p>
      </div>
    </div>
  );
};

export default CompanyCard;
