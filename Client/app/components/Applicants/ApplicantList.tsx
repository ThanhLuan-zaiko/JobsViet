import React from "react";
import ApplicantCard from "./ApplicantCard";

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl: string;
  appliedDate: string;
  jobTitle: string;
  status: "pending" | "reviewed" | "accepted" | "rejected";
}

interface ApplicantListProps {
  applicants: Applicant[];
  currentPage: number;
  itemsPerPage: number;
  onViewResume: (url: string) => void;
  onUpdateStatus: (id: string, status: Applicant["status"]) => void;
}

const ApplicantList: React.FC<ApplicantListProps> = ({
  applicants,
  currentPage,
  itemsPerPage,
  onViewResume,
  onUpdateStatus,
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedApplicants = applicants.slice(startIndex, endIndex);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {paginatedApplicants.map((applicant) => (
        <ApplicantCard
          key={applicant.id}
          applicant={applicant}
          onViewResume={onViewResume}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  );
};

export default ApplicantList;
