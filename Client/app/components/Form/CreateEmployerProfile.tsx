import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  FaCamera,
  FaSave,
  FaPlus,
  FaTrash,
  FaBuilding,
  FaGlobe,
  FaEnvelope,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaUser,
  FaPhone,
  FaBriefcase,
  FaLinkedin,
} from "react-icons/fa";

interface EmployerProfileTabProps {
  profile: any;
  onSubmit: (
    formData: any,
    companies: any[],
    profileImage: File | null,
    companyImages: { [key: string]: File[] }
  ) => void;
  saving: boolean;
  onCancel?: () => void;
  onDeleteImage?: (imageId: string) => void;
  onDeleteCompanyImage?: (imageId: string) => void;
}

// Sub-component for individual Company Form to support useDropzone hook
const CompanyFormItem: React.FC<{
  company: any;
  index: number;
  onChange: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
  companyImages: { [key: string]: File[] };
  setCompanyImages: React.Dispatch<
    React.SetStateAction<{ [key: string]: File[] }>
  >;
  onDeleteCompanyImage?: (imageId: string) => void;
}> = ({
  company,
  index,
  onChange,
  onRemove,
  companyImages,
  setCompanyImages,
  onDeleteCompanyImage,
}) => {
    // --- Logo Dropzone ---
    const onDropLogo = useCallback((acceptedFiles: File[]) => {
    }, []);

    // --- Company Gallery Dropzone ---
    const onDropGallery = useCallback(
      (acceptedFiles: File[]) => {
        if (acceptedFiles?.length > 0) {
          setCompanyImages((prev) => {
            const key = company.id;
            const currentImages = prev[key] || [];
            return {
              ...prev,
              [key]: [...currentImages, ...acceptedFiles],
            };
          });
        }
      },
      [company.id, setCompanyImages]
    );

    const {
      getRootProps: getGalleryRootProps,
      getInputProps: getGalleryInputProps,
      isDragActive: isGalleryDragActive,
    } = useDropzone({
      onDrop: onDropGallery,
      accept: { "image/*": [] },
      multiple: true,
    });

    const removeNewImage = (imgIndex: number) => {
      setCompanyImages((prev) => {
        const key = company.id;
        const currentImages = prev[key] || [];
        const updatedImages = currentImages.filter((_, i) => i !== imgIndex);
        return {
          ...prev,
          [key]: updatedImages,
        };
      });
    };

    return (
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-sm">
              {index + 1}
            </div>
            Công ty {index + 1}
          </h3>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Xóa công ty này"
          >
            <FaTrash />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tên công ty <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaBuilding />
                </div>
                <input
                  type="text"
                  value={company.name}
                  onChange={(e) => onChange(index, "name", e.target.value)}
                  className="w-full pl-10 px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Nhập tên công ty"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaUser />
                </div>
                <input
                  type="text"
                  value={company.role}
                  onChange={(e) => onChange(index, "role", e.target.value)}
                  className="w-full pl-10 px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="VD: CEO, HR Manager"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Logo URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaGlobe />
                </div>
                <input
                  type="url"
                  value={company.logoURL}
                  onChange={(e) => onChange(index, "logoURL", e.target.value)}
                  className="w-full pl-10 px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="https://..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaMapMarkerAlt />
                </div>
                <input
                  type="text"
                  value={company.address}
                  onChange={(e) => onChange(index, "address", e.target.value)}
                  className="w-full pl-10 px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Địa chỉ trụ sở chính"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Website
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaGlobe />
                </div>
                <input
                  type="url"
                  value={company.website}
                  onChange={(e) => onChange(index, "website", e.target.value)}
                  className="w-full pl-10 px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email liên hệ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaEnvelope />
                </div>
                <input
                  type="email"
                  value={company.contactEmail}
                  onChange={(e) => onChange(index, "contactEmail", e.target.value)}
                  className="w-full pl-10 px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="email@company.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Quy mô
                </label>
                <select
                  value={company.companySize}
                  onChange={(e) => onChange(index, "companySize", e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Chọn quy mô</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="500+">500+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Năm TL
                </label>
                <input
                  type="number"
                  value={company.foundedYear}
                  onChange={(e) =>
                    onChange(index, "foundedYear", e.target.value)
                  }
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Lĩnh vực
              </label>
              <input
                type="text"
                value={company.industry}
                onChange={(e) => onChange(index, "industry", e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="VD: IT, Marketing..."
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Mô tả công ty
          </label>
          <textarea
            value={company.description}
            onChange={(e) => onChange(index, "description", e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="Giới thiệu về công ty..."
          />
        </div>

        {/* Gallery Images Dropzone */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hình ảnh công ty (Kéo thả để tải lên nhiều ảnh)
          </label>

          {/* Dropzone Area */}
          <div
            {...getGalleryRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isGalleryDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
              }`}
          >
            <input {...getGalleryInputProps()} />
            <FaCamera className="mx-auto text-3xl text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              {isGalleryDragActive
                ? "Thả ảnh vào đây..."
                : "Kéo thả ảnh vào đây, hoặc nhấn để chọn"}
            </p>
          </div>

          {/* Existing Images Preview */}
          {company.images && company.images.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Ảnh hiện tại:
              </h4>
              <div className="flex flex-wrap gap-3">
                {company.images.map((img: any) => (
                  <div
                    key={img.companyImageId || img.imageId}
                    className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      src={import.meta.env.VITE_IMAGES_SERVICE + img.filePath}
                      alt="Company"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => onDeleteCompanyImage && onDeleteCompanyImage(img.companyImageId || img.imageId)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Preview */}
          {companyImages[company.id] && companyImages[company.id].length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Ảnh mới tải lên:
              </h4>
              <div className="flex flex-wrap gap-3">
                {companyImages[company.id].map((file, i) => (
                  <div
                    key={i}
                    className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

const CreateEmployerProfile: React.FC<EmployerProfileTabProps> = ({
  profile,
  onSubmit,
  saving,
  onCancel,
  onDeleteImage,
  onDeleteCompanyImage,
}) => {
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || "",
    contactPhone: profile?.contactPhone || "",
    bio: profile?.bio || "",
    industry: profile?.industry || "",
    position: profile?.position || "",
    yearsOfExperience: profile?.yearsOfExperience || "",
    linkedInProfile: profile?.linkedInProfile || "",
    website: profile?.website || "",
  });

  const [companies, setCompanies] = useState<any[]>(
    profile?.companies?.map((c: any) => ({ ...c, id: c.companyId })) || []
  );
  const [companyImages, setCompanyImages] = useState<{ [key: string]: File[] }>(
    {}
  );
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanyChange = (index: number, field: string, value: string) => {
    const updatedCompanies = [...companies];
    updatedCompanies[index] = { ...updatedCompanies[index], [field]: value };
    setCompanies(updatedCompanies);
  };

  const addCompany = () => {
    setCompanies([
      ...companies,
      {
        id: `temp-${Date.now()}`,
        name: "",
        logoURL: "",
        website: "",
        description: "",
        industry: "",
        companySize: "",
        foundedYear: "",
        address: "",
        contactEmail: "",
        role: "",
        images: [], // Ensure existing images array exists for safer access
      },
    ]);
  };

  const removeCompany = (index: number) => {
    const companyId = companies[index].id;
    const updatedCompanies = companies.filter((_, i) => i !== index);
    setCompanies(updatedCompanies);

    // Remove associated images
    const updatedImages = { ...companyImages };
    delete updatedImages[companyId];
    setCompanyImages(updatedImages);
  };

  // --- Profile Image Dropzone ---
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
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedFormData = {
      DisplayName: formData.displayName || null,
      ContactPhone: formData.contactPhone || null,
      Bio: formData.bio || null,
      Industry: formData.industry || null,
      Position: formData.position,
      YearsOfExperience: formData.yearsOfExperience
        ? parseInt(formData.yearsOfExperience)
        : null,
      LinkedInProfile: formData.linkedInProfile || null,
      Website: formData.website || null,
    };

    const cleanedCompanies = companies
      .filter(
        (company) =>
          company.name &&
          company.name.trim() &&
          company.logoURL &&
          company.logoURL.trim()
      )
      .map((company) => ({
        id: company.id,
        Name: company.name.trim(),
        LogoURL: company.logoURL.trim(),
        Website: company.website?.trim() || null,
        Description: company.description?.trim() || null,
        Industry: company.industry?.trim() || null,
        CompanySize: company.companySize?.trim() || null,
        FoundedYear: company.foundedYear ? parseInt(company.foundedYear) : null,
        Address: company.address?.trim() || null,
        ContactEmail: company.contactEmail?.trim() || null,
        Role: company.role?.trim() || "Owner",
      }));

    onSubmit(cleanedFormData, cleanedCompanies, profileImage, companyImages);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal Info (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaUser className="text-blue-500" />
              Thông tin chung
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên hiển thị <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  placeholder="Nhập tên của bạn"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <FaPhone />
                  </div>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    className="w-full pl-10 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="0912..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chức vụ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <FaBriefcase />
                  </div>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full pl-10 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none"
                    required
                  >
                    <option value="">Chọn chức vụ</option>
                    <option value="Công ty dịch vụ nhân sự">
                      Công ty dịch vụ nhân sự
                    </option>
                    <option value="Công ty săn đầu người">
                      Công ty săn đầu người
                    </option>
                    <option value="Trung tâm giới thiệu việc làm">
                      Trung tâm giới thiệu việc làm
                    </option>
                    <option value="Doanh nghiệp cung ứng lao động">
                      Doanh nghiệp cung ứng lao động
                    </option>
                    <option value="Chuyên viên săn đầu người">
                      Chuyên viên săn đầu người
                    </option>
                    <option value="Cộng tác viên tuyển dụng">
                      Cộng tác viên tuyển dụng
                    </option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kinh nghiệm (năm)
                </label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lĩnh vực hoạt động
                </label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Công nghệ thông tin, Marketing, Bất động sản..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaInfoCircle className="text-blue-500" />
              Giới thiệu bản thân
            </h2>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={5}
              maxLength={2000}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              placeholder="Chia sẻ về kinh nghiệm, phong cách làm việc và những giá trị bạn mang lại..."
            />
            <p className="text-right text-xs text-gray-500 mt-2">
              {formData.bio.length}/2000 ký tự
            </p>
          </div>

          {/* Companies List */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaBuilding className="text-blue-500" />
                Công ty quản lý
              </h2>
              <button
                type="button"
                onClick={addCompany}
                className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 font-medium transition-colors"
              >
                <FaPlus />
                <span>Thêm công ty</span>
              </button>
            </div>

            <div className="space-y-6">
              {companies.map((company, index) => (
                <CompanyFormItem
                  key={company.id}
                  company={company}
                  index={index}
                  onChange={handleCompanyChange}
                  onRemove={removeCompany}
                  companyImages={companyImages}
                  setCompanyImages={setCompanyImages}
                  onDeleteCompanyImage={onDeleteCompanyImage}
                />
              ))}
              {companies.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  Bạn chưa thêm công ty nào. Hãy nhấn "Thêm công ty" để bắt đầu.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Profile Image & Actions (1/3) */}
        <div className="space-y-8">
          {/* Action Buttons (Sticky) */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-8 z-10">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Hành động</h3>
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang lưu...
                  </span>
                ) : (
                  <>
                    <FaSave />
                    <span>Lưu hồ sơ</span>
                  </>
                )}
              </button>

              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                >
                  <span>Hủy bỏ</span>
                </button>
              )}
            </div>
          </div>

          {/* Profile Image Dropzone */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Ảnh đại diện
            </h3>

            <div
              {...getProfileRootProps()}
              className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${isProfileDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
            >
              <input {...getProfileInputProps()} />

              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 shadow-md mb-4 ring-4 ring-white">
                {profileImage ? (
                  <img
                    src={URL.createObjectURL(profileImage)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : profile?.images && profile.images.length > 0 ? (
                  <img
                    src={import.meta.env.VITE_IMAGES_SERVICE + (profile.images.find((img: any) => img.isPrimary)?.filePath || profile.images[0].filePath)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <FaUser className="text-4xl" />
                  </div>
                )}
              </div>

              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
                <FaCamera />
                {isProfileDragActive ? "Thả ảnh vào đây" : "Thay đổi ảnh"}
              </span>
              <p className="text-xs text-gray-400 mt-2 text-center">
                .JPG, .PNG tối đa 5MB
              </p>

              {/* Delete button for existing profile image */}
              {!profileImage && profile?.images && profile.images.length > 0 && onDeleteImage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteImage(profile.images[0].imageId);
                  }}
                  className="mt-4 text-red-500 hover:text-red-700 text-sm flex items-center gap-1 hover:underline"
                >
                  <FaTrash /> Xóa ảnh hiện tại
                </button>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Liên kết</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FaLinkedin />
                  </div>
                  <input
                    type="url"
                    name="linkedInProfile"
                    value={formData.linkedInProfile}
                    onChange={handleInputChange}
                    className="w-full pl-10 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website cá nhân
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FaGlobe />
                  </div>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full pl-10 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateEmployerProfile;
