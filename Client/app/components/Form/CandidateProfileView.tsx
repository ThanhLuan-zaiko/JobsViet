import React, { useState } from "react";
import {
  FaEdit,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
  FaLink,
  FaCalendarAlt,
  FaVenusMars,
  FaEnvelope,
} from "react-icons/fa";

interface CandidateProfileViewProps {
  profile: any;
  onEdit: () => void;
}

const CandidateProfileView: React.FC<CandidateProfileViewProps> = ({
  profile,
  onEdit,
}) => {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Expanded Hero Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-white/50">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 h-48 sm:h-56 relative overflow-hidden">
            {/* Abstract Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg
                className="h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <path d="M0 0 L100 100 L100 0 Z" fill="white" />
              </svg>
            </div>
          </div>

          <div className="relative px-6 sm:px-10 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 -mt-20 sm:-mt-24">
              {/* Profile Image with Ring Effect */}
              <div className="relative group">
                <div className="w-32 h-32 sm:w-44 sm:h-44 bg-white rounded-full p-1.5 shadow-2xl ring-4 ring-white/50 backdrop-blur-sm">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-white">
                    {profile.images && profile.images.length > 0 ? (
                      <img
                        src={
                          import.meta.env.VITE_IMAGES_SERVICE +
                          (profile.images.find((img: any) => img.isPrimary)
                            ?.filePath || profile.images[0].filePath)
                        }
                        alt="Profile"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                        <FaUser className="text-emerald-400 text-5xl" />
                      </div>
                    )}
                  </div>
                </div>
                {/* Verified Badge (Optional - just visual flair for now) */}
                <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1.5 rounded-full border-4 border-white shadow-lg text-xs">
                  <FaUser />
                </div>
              </div>

              {/* Name & Title */}
              <div className="flex-1 text-center sm:text-left pt-2 sm:pt-0 sm:pb-2">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                  {profile.fullName}
                </h1>
                {profile.headline ? (
                  <p className="text-xl font-medium text-emerald-700 mb-4 bg-emerald-50/80 inline-block px-4 py-1.5 rounded-full border border-emerald-100 backdrop-blur-sm">
                    {profile.headline}
                  </p>
                ) : (
                  <p className="text-lg text-gray-500 italic mb-4">
                    Chưa cập nhật chức danh
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-gray-600">
                  {profile.phone && (
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                      <FaPhone className="text-gray-400" />
                      <span className="font-medium">{profile.phone}</span>
                    </div>
                  )}
                  {profile.address && (
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                      <FaMapMarkerAlt className="text-gray-400" />
                      <span className="truncate max-w-[250px] font-medium">
                        {profile.address}
                      </span>
                    </div>
                  )}
                  {profile.email && (
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                      <FaEnvelope className="text-gray-400" />
                      <span className="font-medium">{profile.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <div className="sm:pb-4">
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium group"
                >
                  <FaEdit className="group-hover:rotate-12 transition-transform" />
                  <span>Chỉnh sửa hồ sơ</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Main Info (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Professional Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
                  <FaGraduationCap />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                    Học vấn
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {profile.educationLevel || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 text-xl">
                  <FaBriefcase />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                    Kinh nghiệm
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {profile.experienceYears
                      ? `${profile.experienceYears} năm`
                      : "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            </div>

            {/* About / Bio */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 text-sm">
                  <FaUser />
                </span>
                Giới thiệu bản thân
              </h2>
              {profile.bio ? (
                <div className="prose prose-emerald max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  Chưa có thông tin giới thiệu
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm">
                  <FaBriefcase />
                </span>
                Kỹ năng chuyên môn
              </h2>
              {profile.skills ? (
                <div className="flex flex-wrap gap-2.5">
                  {profile.skills
                    .split(",")
                    .map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-semibold border border-gray-200 shadow-sm hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md transition-all cursor-default"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Chưa cập nhật kỹ năng</p>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Personal Details Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Thông tin chi tiết
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500 flex items-center gap-2 text-sm">
                    <FaCalendarAlt /> Ngày sinh
                  </span>
                  <span className="text-gray-900 font-medium text-sm">
                    {formatDate(profile.dateOfBirth) || "---"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500 flex items-center gap-2 text-sm">
                    <FaVenusMars /> Giới tính
                  </span>
                  <span className="text-gray-900 font-medium text-sm">
                    {profile.gender || "---"}
                  </span>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                {profile.linkedInProfile && (
                  <a
                    href={profile.linkedInProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-[#0a66c2]/10 text-[#0a66c2] rounded-xl hover:bg-[#0a66c2]/20 transition-colors font-medium text-sm"
                  >
                    <FaLink /> LinkedIn
                  </a>
                )}
                {profile.portfolioURL && (
                  <a
                    href={profile.portfolioURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors font-medium text-sm"
                  >
                    <FaLink /> Portfolio Website
                  </a>
                )}
              </div>
            </div>

            {/* Portfolio Gallery */}
            {profile.images &&
              profile.images.filter((img: any) => !img.isPrimary).length >
              0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
                    <span>Portfolio</span>
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                      {profile.images.filter((img: any) => !img.isPrimary)
                        .length + " ảnh"}
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {profile.images
                      .filter((img: any) => !img.isPrimary)
                      .slice(0, 4) // Show max 4 images in sidebar
                      .map((image: any, index: number) => (
                        <div
                          key={image.imageId || index}
                          className="relative group aspect-square rounded-xl overflow-hidden cursor-zoom-in"
                          onClick={() =>
                            setActiveImage(
                              import.meta.env.VITE_IMAGES_SERVICE +
                              image.filePath
                            )
                          }
                        >
                          <img
                            src={
                              import.meta.env.VITE_IMAGES_SERVICE +
                              image.filePath
                            }
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        </div>
                      ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Image Lightbox/Modal */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActiveImage(null)}
        >
          <img
            src={activeImage}
            alt="Full size"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
          />
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 focus:outline-none"
            onClick={() => setActiveImage(null)}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default CandidateProfileView;
