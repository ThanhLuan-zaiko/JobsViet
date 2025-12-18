import React from "react";
import ManageJobCard from "./ManageJobCard";

interface Job {
  id: string;
  guid: string;
  jobId: string | number;
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
  onDelete: (id: string | number) => void;
  onToggleStatus: (id: string | number) => void;
}

const ManageJobList: React.FC<ManageJobListProps> = ({
  jobs,
  currentPage,
  itemsPerPage,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {

  // Filter out any null or undefined jobs just to be safe
  const validJobs = jobs.filter(job => job && job.jobId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {validJobs.map((job) => (
        <ManageJobCard
          key={job.jobId}
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
