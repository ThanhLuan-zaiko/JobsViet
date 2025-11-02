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
} from "react-icons/fa";

interface EmployerProfileViewProps {
  profile: any;
  onEdit: () => void;
}

const EmployerProfileView: React.FC<EmployerProfileViewProps> = ({
  profile,
  onEdit,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32"></div>
          <div className="relative px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6 -mt-16">
              <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
                {profile.images && profile.images.length > 0 ? (
                  <img
                    src={
                      import.meta.env.VITE_IMAGES_SERVICE +
                      (profile.images.find((img: any) => img.isPrimary)
                        ?.filePath || profile.images[0].filePath)
                    }
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                    <FaUser className="text-gray-400 text-3xl" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile.displayName}
                </h1>
                {profile.position && (
                  <p className="text-xl text-gray-600 mb-4">
                    {profile.position}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {profile.contactPhone && (
                    <div className="flex items-center space-x-2">
                      <FaPhone />
                      <span>{profile.contactPhone}</span>
                    </div>
                  )}
                  {profile.industry && (
                    <div className="flex items-center space-x-2">
                      <FaBriefcase />
                      <span>{profile.industry}</span>
                    </div>
                  )}
                  {profile.yearsOfExperience && (
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt />
                      <span>{profile.yearsOfExperience} năm kinh nghiệm</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={onEdit}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FaEdit />
                <span>Chỉnh sửa hồ sơ</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* About Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio */}
            {profile.bio && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <FaUser className="mr-3 text-blue-600" />
                  Giới thiệu
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Companies/Projects */}
            {profile.companies && profile.companies.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <FaBuilding className="mr-3 text-blue-600" />
                  Các công ty
                </h2>
                <div className="space-y-6">
                  {profile.companies.map((company: any, index: number) => (
                    <div
                      key={company.companyId || index}
                      className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-20 h-20 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">
                          {company.images && company.images.length > 0 ? (
                            <img
                              src={
                                import.meta.env.VITE_IMAGES_SERVICE +
                                company.images[0].filePath
                              }
                              alt={company.name}
                              className="w-full h-full rounded-lg object-cover"
                            />
                          ) : (
                            <FaBuilding className="text-gray-400 text-2xl" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {company.name}
                            {company.companyCode && (
                              <span className="text-sm text-gray-500 ml-2">
                                ({company.companyCode})
                              </span>
                            )}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {company.industry && (
                              <div className="flex items-center space-x-2 text-gray-600">
                                <FaBriefcase className="text-blue-500" />
                                <span>{company.industry}</span>
                              </div>
                            )}
                            {company.size && (
                              <div className="flex items-center space-x-2 text-gray-600">
                                <FaUsers className="text-blue-500" />
                                <span>{company.size}</span>
                              </div>
                            )}
                            {company.foundedYear && (
                              <div className="flex items-center space-x-2 text-gray-600">
                                <FaCalendarAlt className="text-blue-500" />
                                <span>Thành lập {company.foundedYear}</span>
                              </div>
                            )}
                            {company.website && (
                              <div className="flex items-center space-x-2">
                                <FaLink className="text-blue-500" />
                                <a
                                  href={company.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  Website
                                </a>
                              </div>
                            )}
                          </div>
                          {company.description && (
                            <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                              {company.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {company.contactEmail && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <FaEnvelope className="text-blue-500" />
                                <span>{company.contactEmail}</span>
                              </div>
                            )}
                            {company.address && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <FaMapMarkerAlt className="text-blue-500" />
                                <span>{company.address}</span>
                              </div>
                            )}
                          </div>
                          {company.images && company.images.length > 1 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Hình ảnh công ty
                              </h4>
                              <div className="grid grid-cols-3 gap-2">
                                {company.images
                                  .slice(1)
                                  .map((image: any, imgIndex: number) => (
                                    <img
                                      key={imgIndex}
                                      src={
                                        import.meta.env.VITE_IMAGES_SERVICE +
                                        image.filePath
                                      }
                                      alt={`${company.name} ${imgIndex + 2}`}
                                      className="w-full h-20 object-cover rounded-lg shadow-sm"
                                    />
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Links */}
            {(profile.linkedInProfile || profile.website) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FaLink className="mr-3 text-blue-600" />
                  Liên kết
                </h2>
                <div className="space-y-4">
                  {profile.linkedInProfile && (
                    <a
                      href={profile.linkedInProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-300"
                    >
                      <FaLink className="text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">LinkedIn</p>
                        <p className="text-sm text-gray-600">Xem hồ sơ</p>
                      </div>
                    </a>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-300"
                    >
                      <FaLink className="text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">Website</p>
                        <p className="text-sm text-gray-600">Truy cập</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Thống kê</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Công ty</span>
                  <button
                    onClick={openModal}
                    className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {profile.companies?.length || 0}
                  </button>
                </div>
                {profile.yearsOfExperience && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Kinh nghiệm</span>
                    <span className="font-semibold text-gray-900">
                      {profile.yearsOfExperience} năm
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal for Company List */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm animate-fadeIn flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FaBuilding className="mr-3 text-blue-600" />
                  Danh sách công ty ({profile.companies?.length || 0})
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {profile.companies && profile.companies.length > 0 ? (
                  <div className="space-y-6">
                    {profile.companies.map((company: any, index: number) => (
                      <div
                        key={company.companyId || index}
                        className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow duration-300"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-20 h-20 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">
                            {company.images && company.images.length > 0 ? (
                              <img
                                src={
                                  import.meta.env.VITE_IMAGES_SERVICE +
                                  company.images[0].filePath
                                }
                                alt={company.name}
                                className="w-full h-full rounded-lg object-cover"
                              />
                            ) : (
                              <FaBuilding className="text-gray-400 text-2xl" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {company.name}
                              {company.companyCode && (
                                <span className="text-sm text-gray-500 ml-2">
                                  ({company.companyCode})
                                </span>
                              )}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              {company.industry && (
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <FaBriefcase className="text-blue-500" />
                                  <span>{company.industry}</span>
                                </div>
                              )}
                              {company.size && (
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <FaUsers className="text-blue-500" />
                                  <span>{company.size}</span>
                                </div>
                              )}
                              {company.foundedYear && (
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <FaCalendarAlt className="text-blue-500" />
                                  <span>Thành lập {company.foundedYear}</span>
                                </div>
                              )}
                              {company.website && (
                                <div className="flex items-center space-x-2">
                                  <FaLink className="text-blue-500" />
                                  <a
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    Website
                                  </a>
                                </div>
                              )}
                            </div>
                            {company.description && (
                              <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                                {company.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {company.contactEmail && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <FaEnvelope className="text-blue-500" />
                                  <span>{company.contactEmail}</span>
                                </div>
                              )}
                              {company.address && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <FaMapMarkerAlt className="text-blue-500" />
                                  <span>{company.address}</span>
                                </div>
                              )}
                            </div>
                            {company.images && company.images.length > 1 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                  Hình ảnh công ty
                                </h4>
                                <div className="grid grid-cols-3 gap-2">
                                  {company.images
                                    .slice(1)
                                    .map((image: any, imgIndex: number) => (
                                      <img
                                        key={imgIndex}
                                        src={
                                          import.meta.env.VITE_IMAGES_SERVICE +
                                          image.filePath
                                        }
                                        alt={`${company.name} ${imgIndex + 2}`}
                                        className="w-full h-20 object-cover rounded-lg shadow-sm"
                                      />
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaBuilding className="text-gray-400 text-6xl mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">
                      Không có công ty nào
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerProfileView;
