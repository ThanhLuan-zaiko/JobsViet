import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

import {
  FaCamera,
  FaSave,
  FaUser,
  FaPhone,
  FaCalendarAlt,
  FaVenusMars,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
  FaStar,
  FaLinkedin,
  FaGlobe,
  FaIdCard,
  FaTrash,
} from "react-icons/fa";
import type { IconType } from "react-icons";

const InputGroup = ({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: IconType;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
      <Icon className="text-emerald-500" />
      {label}
    </label>
    {children}
  </div>
);

interface CandidateProfileTabProps {
  profile: any;
  onSubmit: (
    formData: any,
    profileImage: File | null,
    portfolioImages: File[]
  ) => void;
  saving: boolean;
  onCancel?: () => void;
  onDeleteImage?: (imageId: string) => void;
}

const CreateCandidateProfile: React.FC<CandidateProfileTabProps> = ({
  profile,
  onSubmit,
  saving,
  onCancel,
  onDeleteImage,
}) => {
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || "",
    phone: profile?.phone || "",
    headline: profile?.headline || "",
    dateOfBirth: profile?.dateOfBirth || "",
    gender: profile?.gender || "",
    address: profile?.address || "",
    educationLevel: profile?.educationLevel || "",
    experienceYears: profile?.experienceYears || "",
    skills: profile?.skills || "",
    linkedInProfile: profile?.linkedInProfile || "",
    portfolioURL: profile?.portfolioURL || "",
    bio: profile?.bio || "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [portfolioImages, setPortfolioImages] = useState<File[]>([]);
  const [dateOfBirthError, setDateOfBirthError] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate date of birth on change
    if (name === "dateOfBirth") {
      if (!validateDateOfBirth(value)) {
        setDateOfBirthError("Bạn phải ít nhất 16 tuổi.");
      } else {
        setDateOfBirthError("");
      }
    }
  };

  const onDropProfile = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      setProfileImage(acceptedFiles[0]);
    }
  }, []);

  const {
    getRootProps: getProfileRootProps,
    getInputProps: getProfileInputProps,
    isDragActive: isProfileDragActive,
  } = useDropzone({
    onDrop: onDropProfile,
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
    multiple: false,
  });

  const onDropPortfolio = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      setPortfolioImages((prev) => [...prev, ...acceptedFiles]);
    }
  }, []);

  const {
    getRootProps: getPortfolioRootProps,
    getInputProps: getPortfolioInputProps,
    isDragActive: isPortfolioDragActive,
  } = useDropzone({
    onDrop: onDropPortfolio,
    accept: {
      "image/*": [],
    },
    multiple: true,
  });


  const validateDateOfBirth = (dateOfBirth: string): boolean => {
    if (!dateOfBirth) return true; // Optional field
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age >= 16;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate date of birth
    if (!validateDateOfBirth(formData.dateOfBirth)) {
      setDateOfBirthError("Bạn phải ít nhất 16 tuổi.");
      return;
    }

    // Clean form data: convert empty strings to null for optional fields
    const cleanedFormData = {
      ...formData,
      phone: formData.phone || null,
      headline: formData.headline || null,
      dateOfBirth: formData.dateOfBirth || null,
      gender: formData.gender || null,
      address: formData.address || null,
      educationLevel: formData.educationLevel || null,
      experienceYears: formData.experienceYears
        ? parseInt(formData.experienceYears)
        : null,
      skills: formData.skills || null,
      linkedInProfile: formData.linkedInProfile || null,
      portfolioURL: formData.portfolioURL || null,
      bio: formData.bio || null,
    };

    onSubmit(cleanedFormData, profileImage, portfolioImages);
  };

  const handleRemoveNewPortfolioImage = (index: number) => {
    setPortfolioImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Hồ Sơ Ứng Viên
          </h1>
          <p className="text-gray-600">
            Hãy điền đầy đủ thông tin để nhà tuyển dụng có thể tìm thấy bạn dễ
            dàng hơn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3 pb-4 border-b">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <FaUser className="text-emerald-600 text-lg" />
                </div>
                Thông tin cá nhân
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Họ và tên" icon={FaUser}>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    maxLength={200}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                    placeholder="Nhập họ tên đầy đủ"
                  />
                </InputGroup>

                <InputGroup label="Số điện thoại" icon={FaPhone}>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength={50}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="Nhập số điện thoại"
                  />
                </InputGroup>

                <InputGroup label="Ngày sinh" icon={FaCalendarAlt}>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  {dateOfBirthError && (
                    <p className="text-red-500 text-xs mt-1">
                      {dateOfBirthError}
                    </p>
                  )}
                </InputGroup>

                <InputGroup label="Giới tính" icon={FaVenusMars}>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </InputGroup>

                <div className="md:col-span-2">
                  <InputGroup label="Địa chỉ" icon={FaMapMarkerAlt}>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      maxLength={500}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      placeholder="Nhập địa chỉ hiện tại"
                    />
                  </InputGroup>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3 pb-4 border-b">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaBriefcase className="text-blue-600 text-lg" />
                </div>
                Thông tin chuyên môn
              </h2>
              <div className="space-y-6">
                <InputGroup label="Headline (Chức danh chính)" icon={FaIdCard}>
                  <input
                    type="text"
                    name="headline"
                    value={formData.headline}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Senior React Developer"
                    maxLength={300}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </InputGroup>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Trình độ học vấn" icon={FaGraduationCap}>
                    <select
                      name="educationLevel"
                      value={formData.educationLevel}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                      <option value="">Chọn trình độ</option>
                      <option value="Cấp 3">Cấp 3</option>
                      <option value="Trung cấp">Trung cấp</option>
                      <option value="Cao đẳng">Cao đẳng</option>
                      <option value="Đại học">Đại học</option>
                      <option value="Thạc sĩ">Thạc sĩ</option>
                      <option value="Tiến sĩ">Tiến sĩ</option>
                    </select>
                  </InputGroup>

                  <InputGroup label="Kinh nghiệm (năm)" icon={FaStar}>
                    <input
                      type="number"
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleInputChange}
                      min="0"
                      max="50"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </InputGroup>
                </div>

                <InputGroup label="Kỹ năng chính" icon={FaStar}>
                  <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="ReactJS, NodeJS, SQL, Teamwork..."
                    rows={3}
                    maxLength={2000}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                </InputGroup>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="LinkedIn Profile" icon={FaLinkedin}>
                    <input
                      type="url"
                      name="linkedInProfile"
                      value={formData.linkedInProfile}
                      onChange={handleInputChange}
                      maxLength={300}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </InputGroup>

                  <InputGroup label="Portfolio / Website cá nhân" icon={FaGlobe}>
                    <input
                      type="url"
                      name="portfolioURL"
                      value={formData.portfolioURL}
                      onChange={handleInputChange}
                      maxLength={300}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="https://myportfolio.com"
                    />
                  </InputGroup>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3 pb-4 border-b">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FaIdCard className="text-purple-600 text-lg" />
                </div>
                Giới thiệu bản thân
              </h2>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Viết một đoạn ngắn giới thiệu về bản thân, mục tiêu nghề nghiệp..."
                rows={6}
                maxLength={2000}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Right Column - Images & Actions */}
          <div className="space-y-8">
            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Tác vụ</h2>
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSave />
                  <span>{saving ? "Đang lưu..." : "Lưu hồ sơ"}</span>
                </button>

                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
                  >
                    <span>Hủy bỏ</span>
                  </button>
                )}
              </div>
            </div>

            {/* Profile Image */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Ảnh đại diện
              </h2>
              <div
                {...getProfileRootProps()}
                className={`relative group cursor-pointer aspect-square w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${isProfileDragActive
                  ? "border-emerald-500 bg-emerald-50 scale-[1.02]"
                  : "border-gray-300 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-400"
                  }`}
              >
                <input {...getProfileInputProps()} />
                {profileImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={URL.createObjectURL(profileImage)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProfileImage(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors z-10 shadow-md"
                    >
                      <FaTrash size={12} />
                    </button>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-medium text-sm flex items-center gap-2">
                        <FaCamera /> Thay đổi ảnh
                      </p>
                    </div>
                  </div>
                ) : profile?.images?.find((img: any) => img.isPrimary) ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={`${import.meta.env.VITE_IMAGES_SERVICE}${profile.images.find((img: any) => img.isPrimary)
                        .filePath
                        }`}
                      alt="Current Profile"
                      className="w-full h-full object-cover"
                    />
                    {onDeleteImage && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteImage(
                            profile.images.find((img: any) => img.isPrimary)
                              .imageId
                          );
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-10 shadow-md"
                        title="Xóa ảnh hiện tại"
                      >
                        <FaTrash size={12} />
                      </button>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-medium text-sm flex items-center gap-2">
                        <FaCamera /> Thay đổi ảnh
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <FaCamera
                      className={`text-4xl mb-2 transition-colors ${isProfileDragActive
                        ? "text-emerald-600"
                        : "text-gray-400 group-hover:text-emerald-500"
                        }`}
                    />
                    <span
                      className={`text-sm text-center px-4 ${isProfileDragActive
                        ? "text-emerald-700 font-medium"
                        : "text-gray-500 group-hover:text-emerald-600"
                        }`}
                    >
                      {isProfileDragActive
                        ? "Thả ảnh vào đây"
                        : "Kéo thả hoặc nhấn để tải ảnh"}
                    </span>
                  </>
                )}
              </div>
            </div>


            {/* Portfolio Images */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Ảnh Portfolio
              </h2>
              <div className="space-y-4">
                <div
                  {...getPortfolioRootProps()}
                  className={`w-full h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer ${isPortfolioDragActive
                    ? "border-blue-500 bg-blue-50 scale-[1.02]"
                    : "border-gray-300 bg-gray-50 hover:bg-blue-50 hover:border-blue-400"
                    }`}
                >
                  <input {...getPortfolioInputProps()} />
                  <FaCamera
                    className={`text-3xl mb-2 transition-colors ${isPortfolioDragActive
                      ? "text-blue-600"
                      : "text-gray-400 group-hover:text-blue-500"
                      }`}
                  />
                  <span
                    className={`text-sm text-center px-4 ${isPortfolioDragActive
                      ? "text-blue-700 font-medium"
                      : "text-gray-500 group-hover:text-blue-600"
                      }`}
                  >
                    {isPortfolioDragActive
                      ? "Thả ảnh vào đây"
                      : "Kéo thả hoặc nhấn để tải nhiều ảnh"}
                  </span>
                </div>


                <div className="grid grid-cols-2 gap-2">
                  {/* Existing Portfolio Images */}
                  {profile?.images
                    ?.filter((img: any) => !img.isPrimary)
                    .map((img: any, index: number) => (
                      <div
                        key={`existing-${index}`}
                        className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 group"
                      >
                        <img
                          src={`${import.meta.env.VITE_IMAGES_SERVICE}${img.filePath
                            }`}
                          alt={`Existing Portfolio ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full z-10">
                          Đã lưu
                        </div>
                        {onDeleteImage && (
                          <button
                            type="button"
                            onClick={() => onDeleteImage(img.imageId)}
                            className="absolute bottom-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-20"
                            title="Xóa ảnh này"
                          >
                            <FaTrash size={12} />
                          </button>
                        )}
                      </div>
                    ))}

                  {/* New Portfolio Images */}
                  {portfolioImages.length > 0 &&
                    portfolioImages.map((file, index) => (
                      <div
                        key={`new-${index}`}
                        className="relative aspect-video rounded-lg overflow-hidden border border-emerald-200 group"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New Portfolio ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 right-1 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full z-10">
                          Mới
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewPortfolioImage(index)}
                          className="absolute bottom-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-20"
                          title="Xóa khỏi danh sách tải lên"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                </div>

                {portfolioImages.length > 0 && (
                  <p className="text-xs text-gray-500 text-center">
                    Đã thêm {portfolioImages.length} ảnh mới
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateCandidateProfile;
