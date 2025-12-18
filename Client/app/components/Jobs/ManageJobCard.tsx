import React from "react";
import { Link } from "react-router";
import { FaEdit, FaTrash, FaPowerOff, FaEye } from "react-icons/fa";

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

interface ManageJobCardProps {
  job: Job;
  onEdit: (id: string) => void;
  onDelete: (id: string | number) => void;
  onToggleStatus: (id: string | number) => void;
}

const ManageJobCard: React.FC<ManageJobCardProps> = ({
  job,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full relative group">
      {/* Badge Status */}
      <div className="absolute top-2 right-2 z-10">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${job.status === "active"
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-600"
            }`}
        >
          {job.status === "active" ? "Hoạt động" : "Đã ẩn"}
        </span>
      </div>

      <Link to={`/job/${job.guid}`} className="block overflow-hidden">
        <img
          src={job.imageUrl}
          alt={job.title}
          className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Job+Image';
          }}
        />
      </Link>

      <div className="p-4 flex-1 flex flex-col">
        <Link to={`/job/${job.guid}`} className="hover:text-blue-600 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1" title={job.title}>
            {job.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 mb-1 line-clamp-1">{job.company}</p>
        <p className="text-sm text-gray-500 mb-2">{job.location}</p>
        <p className="text-sm font-medium text-green-600 mb-3">{job.salary}</p>
        <p className="text-sm text-gray-700 line-clamp-2 mb-4 flex-1">
          {job.description}
        </p>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2 mt-auto">
          <Link
            to={`/job/${job.guid}`}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
            title="Xem chi tiết"
          >
            <FaEye size={18} />
          </Link>

          <button
            onClick={() => onEdit(job.guid)}
            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-all"
            title="Chỉnh sửa"
          >
            <FaEdit size={18} />
          </button>

          <button
            onClick={() => onToggleStatus(job.jobId)}
            className={`p-2 rounded-full transition-all ${job.status === "active"
              ? "text-green-600 hover:bg-green-50 hover:text-green-700"
              : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              }`}
            title={job.status === "active" ? "Tạm dừng" : "Kích hoạt"}
          >
            <FaPowerOff size={18} />
          </button>

          <button
            onClick={() => onDelete(job.jobId)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
            title="Xóa tin"
          >
            <FaTrash size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageJobCard;
