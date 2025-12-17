import React from "react";
import ManageJobCard from "./ManageJobCard";

interface Job {
  id: string;
  guid: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  imageUrl: string;
  status: "active" | "inactive";
}

interface ManageJobListProps {
  jobs: Job[];
  currentPage: number;
  itemsPerPage: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const ManageJobList: React.FC<ManageJobListProps> = ({
  jobs,
  currentPage,
  itemsPerPage,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  console.log("ManageJobList received jobs:", jobs);
  console.log("First job sample:", jobs[0]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedJobs = jobs.slice(startIndex, endIndex);

  console.log("Paginated jobs:", paginatedJobs);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {paginatedJobs.map((job) => (
        <ManageJobCard
          key={job.id}
          job={job}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
};

export default ManageJobList;
