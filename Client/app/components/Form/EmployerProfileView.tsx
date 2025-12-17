import React, { useState } from "react";
import {
  FaEdit,
  FaUser,
  FaPhone,
  FaBriefcase,
  FaLink,
  FaBuilding,
  FaMapMarkerAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaUsers,
  FaTimes,
  FaTrash,
  FaGlobe,
  FaChevronRight,
  FaExternalLinkAlt,
  FaChartLine,
} from "react-icons/fa";
import ConfirmationModal from "../Common/ConfirmationModal";

interface EmployerProfileViewProps {
  profile: any;
  onEdit: () => void;
  onDeleteCompany?: (companyId: string) => void;
}

const EmployerProfileView: React.FC<EmployerProfileViewProps> = ({
  profile,
  onEdit,
  onDeleteCompany,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);
  const [companyNameToDelete, setCompanyNameToDelete] = useState<string>("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openDeleteDialog = (companyId: string) => {
    const company = profile.companies?.find(
      (c: any) => c.companyId === companyId
    );
    setCompanyToDelete(companyId);
    setCompanyNameToDelete(company?.name || "");
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setCompanyToDelete(null);
    setCompanyNameToDelete("");
  };

  const handleDeleteConfirm = () => {
    if (companyToDelete && onDeleteCompany) {
      onDeleteCompany(companyToDelete);
    }
    closeDeleteDialog();
  };

  /* Logic to limit companies to 3 and show "View All" button */
  const displayedCompanies = profile.companies?.slice(0, 3) || [];
  const remainingCompaniesCount = (profile.companies?.length || 0) - 3;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Hero Section - Following CandidateProfileView pattern */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-white/50">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 h-48 sm:h-56 relative overflow-hidden">
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
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                        <FaUser className="text-blue-400 text-5xl" />
                      </div>
                    )}
                  </div>
                </div>
                {/* Verified Badge */}
                <div className="absolute bottom-2 right-2 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-white shadow-lg text-xs">
                  <FaUser />
                </div>
              </div>

              {/* Name & Title */}
              <div className="flex-1 text-center sm:text-left pt-2 sm:pt-0 sm:pb-2">
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Tên hiển thị</p>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                  {profile.displayName || 'Chưa cập nhật'}
                </h1>
                {profile.position ? (
                  <p className="text-xl font-medium text-indigo-700 mb-4 bg-indigo-50/80 inline-block px-4 py-1.5 rounded-full border border-indigo-100 backdrop-blur-sm">
                    {profile.position}
                  </p>
                ) : (
                  <p className="text-lg text-gray-500 italic mb-4">
                    Chưa cập nhật chức vụ
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-gray-600">
                  {profile.yearsOfExperience && (
                    <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                      <FaCalendarAlt className="text-amber-500" />
                      <span className="font-medium">{profile.yearsOfExperience} năm kinh nghiệm</span>
                    </div>
                  )}
                  {profile.contactPhone && (
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                      <FaPhone className="text-gray-400" />
                      <span className="font-medium">{profile.contactPhone}</span>
                    </div>
                  )}
                  {profile.industry && (
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                      <FaBriefcase className="text-gray-400" />
                      <span className="font-medium">{profile.industry}</span>
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
                  <span>Chỉnh sửa</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio Section */}
            {profile.bio && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaUser className="text-indigo-500" /> Giới thiệu
                </h2>
                <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">
                  {profile.bio}
                </div>
              </div>
            )}

            {/* Companies Section */}
            {profile.companies && profile.companies.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FaBuilding className="text-blue-600" /> Các công ty quản lý
                  </h2>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                    {profile.companies.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {displayedCompanies.map((company: any, index: number) => (
                    <div
                      key={company.companyId || index}
                      className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="flex gap-5">
                        {/* Company Image/Logo */}
                        <div className="w-24 h-24 bg-gray-50 rounded-lg shrink-0 border border-gray-100 flex items-center justify-center overflow-hidden">
                          {company.logoURL ? (
                            <img
                              src={company.logoURL}
                              alt={company.name}
                              className="w-full h-full object-contain p-2"
                            />
                          ) : company.images && company.images.length > 0 ? (
                            <img
                              src={import.meta.env.VITE_IMAGES_SERVICE + company.images[0].filePath}
                              alt={company.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FaBuilding className="text-gray-300 text-3xl" />
                          )}
                        </div>

                        {/* Company Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                {company.name}
                              </h3>
                              <p className="text-sm text-gray-500 mt-0.5">
                                Vai trò: <span className="font-medium text-gray-800">{company.role || "Quản trị viên"}</span>
                              </p>
                            </div>
                            <button
                              onClick={() => openDeleteDialog(company.companyId)}
                              className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <FaTrash />
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-2 my-3">
                            {company.industry && (
                              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium">
                                {company.industry}
                              </span>
                            )}
                            {company.companySize && (
                              <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-medium">
                                {company.companySize}
                              </span>
                            )}
                            {company.foundedYear && (
                              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded font-medium">
                                Thành lập {company.foundedYear}
                              </span>
                            )}
                          </div>

                          {/* Company Description */}
                          {company.description && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-sm text-gray-600 line-clamp-2">{company.description}</p>
                            </div>
                          )}

                          <div className="text-sm text-gray-500 space-y-1 mt-3">
                            {company.website && (
                              <div className="flex items-center gap-2">
                                <FaGlobe className="text-xs" />
                                <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-indigo-600 truncate">
                                  {company.website.replace(/^https?:\/\//, '')}
                                </a>
                              </div>
                            )}
                            {company.contactEmail && (
                              <div className="flex items-center gap-2">
                                <FaEnvelope className="text-xs" />
                                <span className="truncate">{company.contactEmail}</span>
                              </div>
                            )}
                            {company.address && (
                              <div className="flex items-start gap-2">
                                <FaMapMarkerAlt className="text-xs mt-1" />
                                <span className="line-clamp-1">{company.address}</span>
                              </div>
                            )}
                            {company.logoURL && (
                              <div className="flex items-center gap-2">
                                <FaLink className="text-xs" />
                                <a href={company.logoURL} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-indigo-600 truncate">
                                  Logo URL
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Company Images Gallery */}
                          {company.images && company.images.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <p className="text-xs font-medium text-gray-500 mb-2">Hình ảnh công ty ({company.images.length})</p>
                              <div className="flex gap-2 overflow-x-auto pb-2">
                                {company.images.map((img: any, imgIndex: number) => (
                                  <img
                                    key={img.companyImageId || imgIndex}
                                    src={import.meta.env.VITE_IMAGES_SERVICE + img.filePath}
                                    alt={`${company.name} ${imgIndex + 1}`}
                                    className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0 hover:opacity-75 transition-opacity cursor-pointer"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* View All Button */}
                  {remainingCompaniesCount > 0 && (
                    <button
                      onClick={openModal}
                      className="w-full py-3 bg-gray-50 text-gray-600 font-medium rounded-xl hover:bg-gray-100 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Xem thêm {remainingCompaniesCount} công ty khác</span>
                      <FaChevronRight />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaChartLine className="text-indigo-500" /> Thống kê
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Số lượng công ty</span>
                  <span className="font-bold text-gray-900">{profile.companies?.length || 0}</span>
                </div>
                <div className="w-full h-px bg-gray-100"></div>
                {profile.yearsOfExperience && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Kinh nghiệm</span>
                    <span className="font-bold text-gray-900">{profile.yearsOfExperience} năm</span>
                  </div>
                )}
                <div className="w-full h-px bg-gray-100"></div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Trạng thái</span>
                  <span className="text-emerald-600 font-medium text-sm bg-emerald-50 px-2 py-0.5 rounded">Active</span>
                </div>
              </div>
            </div>

            {/* Contact Links */}
            {(profile.linkedInProfile || profile.website) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaLink className="text-indigo-500" /> Liên kết
                </h3>
                <div className="flex flex-col gap-3">
                  {profile.linkedInProfile && (
                    <a
                      href={profile.linkedInProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-blue-600"
                    >
                      <FaLink /> <span className="font-medium">LinkedIn Profile</span>
                    </a>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-emerald-600"
                    >
                      <FaGlobe /> <span className="font-medium">Personal Website</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal for Company List */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col animate-scaleUp">
              {/* Modal Header */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Danh sách công ty</h2>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
                {profile.companies && profile.companies.length > 0 ? (
                  <div className="grid gap-4">
                    {profile.companies.map((company: any, index: number) => (
                      <div
                        key={company.companyId || index}
                        className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex gap-5"
                      >
                        <div className="w-20 h-20 bg-gray-50 rounded-lg shrink-0 flex items-center justify-center border border-gray-100">
                          {company.logoURL ? (
                            <img
                              src={company.logoURL}
                              alt={company.name}
                              className="w-full h-full object-contain rounded-lg p-1"
                            />
                          ) : company.images && company.images.length > 0 ? (
                            <img
                              src={import.meta.env.VITE_IMAGES_SERVICE + company.images[0].filePath}
                              alt={company.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <FaBuilding className="text-gray-300 text-2xl" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <h3 className="font-bold text-gray-900 text-lg">{company.name}</h3>
                            <button onClick={() => openDeleteDialog(company.companyId)} className="text-gray-400 hover:text-red-500">
                              <FaTrash />
                            </button>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{company.role || "Owner"}</p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {company.companySize && <span className="text-xs bg-gray-100 px-2 py-1 rounded">{company.companySize}</span>}
                            {company.industry && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">{company.industry}</span>}
                            {company.foundedYear && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded">Thành lập {company.foundedYear}</span>}
                          </div>

                          {company.description && <p className="text-sm text-gray-600 mb-3">{company.description}</p>}

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 border-t border-gray-100 pt-3">
                            {company.website && (
                              <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-indigo-600">
                                <FaGlobe className="text-xs" /> <span className="truncate max-w-[200px]">{company.website.replace(/^https?:\/\//, '')}</span>
                              </a>
                            )}
                            {company.contactEmail && (
                              <span className="flex items-center gap-1.5">
                                <FaEnvelope className="text-xs" /> <span className="truncate max-w-[200px]">{company.contactEmail}</span>
                              </span>
                            )}
                            {company.address && (
                              <span className="flex items-center gap-1.5 w-full">
                                <FaMapMarkerAlt className="text-xs shrink-0" /> <span className="line-clamp-1">{company.address}</span>
                              </span>
                            )}
                            {company.logoURL && (
                              <a href={company.logoURL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-indigo-600">
                                <FaLink className="text-xs" /> <span>Logo URL</span>
                              </a>
                            )}
                          </div>

                          {/* Company Images Gallery in Modal */}
                          {company.images && company.images.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs font-medium text-gray-500 mb-2">Hình ảnh công ty ({company.images.length})</p>
                              <div className="flex gap-2 overflow-x-auto pb-2">
                                {company.images.map((img: any, imgIndex: number) => (
                                  <img
                                    key={img.companyImageId || imgIndex}
                                    src={import.meta.env.VITE_IMAGES_SERVICE + img.filePath}
                                    alt={`${company.name} ${imgIndex + 1}`}
                                    className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0 hover:opacity-75 transition-opacity cursor-pointer"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">Không có dữ liệu</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Delete */}
        <ConfirmationModal
          isOpen={isDeleteDialogOpen}
          onClose={closeDeleteDialog}
          onConfirm={handleDeleteConfirm}
          title="Xóa công ty"
          message={
            companyNameToDelete
              ? `Bạn có chắc chắn muốn xóa công ty "${companyNameToDelete}"? Hành động này không thể hoàn tác.`
              : "Bạn có chắc chắn muốn xóa công ty này? Hành động này không thể hoàn tác."
          }
        />
      </div>
    </div>
  );
};

export default EmployerProfileView;
