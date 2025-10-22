import React from "react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  imageUrl: string;
  status: "active" | "inactive";
}

interface ManageJobCardProps {
  job: Job;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const ManageJobCard: React.FC<ManageJobCardProps> = ({
  job,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <img
        src={job.imageUrl}
        alt={job.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              job.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {job.status === "active" ? "Hoạt động" : "Không hoạt động"}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-1">{job.company}</p>
        <p className="text-sm text-gray-500 mb-2">{job.location}</p>
        <p className="text-sm font-medium text-green-600 mb-3">{job.salary}</p>
        <p className="text-sm text-gray-700 line-clamp-3 mb-4">
          {job.description}
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(job.id)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Chỉnh sửa
          </button>
          <button
            onClick={() => onToggleStatus(job.id)}
            className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
              job.status === "active"
                ? "bg-yellow-600 text-white hover:bg-yellow-700"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {job.status === "active" ? "Tạm dừng" : "Kích hoạt"}
          </button>
          <button
            onClick={() => onDelete(job.id)}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-200"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageJobCard;
