import React from "react";

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

interface ApplicantCardProps {
  applicant: Applicant;
  onViewResume: (url: string) => void;
  onUpdateStatus: (id: string, status: Applicant["status"]) => void;
}

const ApplicantCard: React.FC<ApplicantCardProps> = ({
  applicant,
  onViewResume,
  onUpdateStatus,
}) => {
  const getStatusColor = (status: Applicant["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Applicant["status"]) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "reviewed":
        return "Đã xem";
      case "accepted":
        return "Đã chấp nhận";
      case "rejected":
        return "Đã từ chối";
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {applicant.name}
          </h3>
          <p className="text-sm text-gray-600">{applicant.jobTitle}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(applicant.status)}`}
        >
          {getStatusText(applicant.status)}
        </span>
      </div>
      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Email:</span> {applicant.email}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Số điện thoại:</span> {applicant.phone}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Ngày ứng tuyển:</span>{" "}
          {applicant.appliedDate}
        </p>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onViewResume(applicant.resumeUrl)}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Xem CV
        </button>
        {applicant.status === "pending" && (
          <>
            <button
              onClick={() => onUpdateStatus(applicant.id, "accepted")}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200"
            >
              Chấp nhận
            </button>
            <button
              onClick={() => onUpdateStatus(applicant.id, "rejected")}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-200"
            >
              Từ chối
            </button>
          </>
        )}
        {applicant.status === "reviewed" && (
          <>
            <button
              onClick={() => onUpdateStatus(applicant.id, "accepted")}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200"
            >
              Chấp nhận
            </button>
            <button
              onClick={() => onUpdateStatus(applicant.id, "rejected")}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-200"
            >
              Từ chối
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ApplicantCard;
