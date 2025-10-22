import React from "react";
import type { Job } from "../../data/mockJobs";

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <img
        src={job.imageUrl}
        alt={job.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {job.title}
        </h3>
        <p className="text-sm text-gray-600 mb-1">{job.company}</p>
        <p className="text-sm text-gray-500 mb-2">{job.location}</p>
        <p className="text-sm font-medium text-green-600 mb-3">{job.salary}</p>
        <p className="text-sm text-gray-700 line-clamp-3">{job.description}</p>
      </div>
    </div>
  );
};

export default JobCard;
