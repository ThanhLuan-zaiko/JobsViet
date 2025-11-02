import React from "react";
import {
  FaEdit,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
  FaLink,
  FaCamera,
} from "react-icons/fa";

interface CandidateProfileViewProps {
  profile: any;
  onEdit: () => void;
}

const CandidateProfileView: React.FC<CandidateProfileViewProps> = ({
  profile,
  onEdit,
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              {profile.images && profile.images.length > 0 ? (
                <img
                  src={
                    import.meta.env.VITE_IMAGES_SERVICE +
                    (profile.images.find((img: any) => img.isPrimary)
                      ?.filePath || profile.images[0].filePath)
                  }
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <FaUser className="text-gray-400 text-2xl" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.fullName}
              </h1>
              {profile.headline && (
                <p className="text-gray-600 mt-1">{profile.headline}</p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                {profile.phone && (
                  <div className="flex items-center space-x-1">
                    <FaPhone />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.address && (
                  <div className="flex items-center space-x-1">
                    <FaMapMarkerAlt />
                    <span>{profile.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaEdit />
            <span>Chỉnh sửa</span>
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Thông tin cá nhân
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên
            </label>
            <p className="text-gray-900">{profile.fullName}</p>
          </div>
          {profile.phone && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <p className="text-gray-900">{profile.phone}</p>
            </div>
          )}
          {profile.dateOfBirth && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày sinh
              </label>
              <p className="text-gray-900">{formatDate(profile.dateOfBirth)}</p>
            </div>
          )}
          {profile.gender && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới tính
              </label>
              <p className="text-gray-900">{profile.gender}</p>
            </div>
          )}
        </div>
        {profile.address && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ
            </label>
            <p className="text-gray-900">{profile.address}</p>
          </div>
        )}
      </div>

      {/* Professional Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Thông tin chuyên môn
        </h2>
        <div className="space-y-6">
          {profile.headline && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Headline
              </label>
              <p className="text-gray-900">{profile.headline}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.educationLevel && (
              <div className="flex items-center space-x-2">
                <FaGraduationCap className="text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trình độ học vấn
                  </label>
                  <p className="text-gray-900">{profile.educationLevel}</p>
                </div>
              </div>
            )}
            {profile.experienceYears && (
              <div className="flex items-center space-x-2">
                <FaBriefcase className="text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số năm kinh nghiệm
                  </label>
                  <p className="text-gray-900">{profile.experienceYears} năm</p>
                </div>
              </div>
            )}
          </div>
          {profile.skills && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kỹ năng
              </label>
              <p className="text-gray-900">{profile.skills}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.linkedInProfile && (
              <div className="flex items-center space-x-2">
                <FaLink className="text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn
                  </label>
                  <a
                    href={profile.linkedInProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {profile.linkedInProfile}
                  </a>
                </div>
              </div>
            )}
            {profile.portfolioURL && (
              <div className="flex items-center space-x-2">
                <FaLink className="text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Portfolio
                  </label>
                  <a
                    href={profile.portfolioURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {profile.portfolioURL}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio Images */}
      {profile.images && profile.images.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Portfolio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.images
              .filter((img: any) => !img.isPrimary)
              .map((image: any, index: number) => (
                <div key={image.imageId || index} className="relative">
                  <img
                    src={import.meta.env.VITE_IMAGES_SERVICE + image.filePath}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Giới thiệu bản thân
          </h2>
          <p className="text-gray-900 whitespace-pre-wrap">{profile.bio}</p>
        </div>
      )}
    </div>
  );
};

export default CandidateProfileView;
