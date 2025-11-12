import React, { useState } from "react";
import { FaCamera, FaSave } from "react-icons/fa";

interface CandidateProfileTabProps {
  profile: any;
  onSubmit: (
    formData: any,
    profileImage: File | null,
    portfolioImages: File[]
  ) => void;
  saving: boolean;
  onCancel?: () => void;
}

const CreateCandidateProfile: React.FC<CandidateProfileTabProps> = ({
  profile,
  onSubmit,
  saving,
  onCancel,
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

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "portfolio"
  ) => {
    const files = e.target.files;
    if (!files) return;

    if (type === "profile") {
      setProfileImage(files[0]);
    } else {
      setPortfolioImages(Array.from(files));
    }
  };

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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Thông tin cá nhân
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              maxLength={50}
              pattern="^/^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày sinh
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {dateOfBirthError && (
              <p className="text-red-500 text-sm mt-1">{dateOfBirthError}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giới tính
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Thông tin chuyên môn
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Headline
            </label>
            <input
              type="text"
              name="headline"
              value={formData.headline}
              onChange={handleInputChange}
              placeholder="Ví dụ: Frontend Developer với 3 năm kinh nghiệm"
              maxLength={300}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trình độ học vấn
              </label>
              <select
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn trình độ</option>
                <option value="Cấp 3">Cấp 3</option>
                <option value="Trung cấp">Trung cấp</option>
                <option value="Cao đẳng">Cao đẳng</option>
                <option value="Đại học">Đại học</option>
                <option value="Thạc sĩ">Thạc sĩ</option>
                <option value="Tiến sĩ">Tiến sĩ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số năm kinh nghiệm
              </label>
              <input
                type="number"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleInputChange}
                min="0"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kỹ năng
            </label>
            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              placeholder="Liệt kê các kỹ năng của bạn, cách nhau bằng dấu phẩy"
              rows={3}
              maxLength={2000}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn Profile
              </label>
              <input
                type="url"
                name="linkedInProfile"
                value={formData.linkedInProfile}
                onChange={handleInputChange}
                maxLength={300}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portfolio URL
              </label>
              <input
                type="url"
                name="portfolioURL"
                value={formData.portfolioURL}
                onChange={handleInputChange}
                maxLength={300}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Hình ảnh</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh đại diện
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "profile")}
                className="hidden"
                id="profile-image"
              />
              <label
                htmlFor="profile-image"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md cursor-pointer hover:bg-blue-100"
              >
                <FaCamera />
                <span>Chọn ảnh</span>
              </label>
              {profileImage && (
                <span className="text-sm text-gray-600">
                  {profileImage.name}
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh portfolio
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageChange(e, "portfolio")}
                className="hidden"
                id="portfolio-images"
              />
              <label
                htmlFor="portfolio-images"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md cursor-pointer hover:bg-blue-100"
              >
                <FaCamera />
                <span>Chọn ảnh</span>
              </label>
              {portfolioImages.length > 0 && (
                <span className="text-sm text-gray-600">
                  {portfolioImages.length} ảnh đã chọn
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Giới thiệu bản thân
        </h2>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          placeholder="Hãy giới thiệu về bản thân bạn..."
          rows={5}
          maxLength={2000}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <span>Hủy</span>
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <FaSave />
          <span>{saving ? "Đang lưu..." : "Lưu hồ sơ"}</span>
        </button>
      </div>
    </form>
  );
};

export default CreateCandidateProfile;
