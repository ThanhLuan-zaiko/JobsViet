import React, { useState } from "react";
import { FaCamera, FaSave, FaPlus } from "react-icons/fa";

interface EmployerProfileTabProps {
  profile: any;
  onSubmit: (
    formData: any,
    companies: any[],
    profileImage: File | null
  ) => void;
  saving: boolean;
}

const CreateEmployerProfile: React.FC<EmployerProfileTabProps> = ({
  profile,
  onSubmit,
  saving,
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

  const [companies, setCompanies] = useState<any[]>(profile?.companies || []);

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
        website: "",
        description: "",
        industry: "",
        size: "",
        foundedYear: "",
        address: "",
        contactEmail: "",
      },
    ]);
  };

  const removeCompany = (index: number) => {
    setCompanies(companies.filter((_, i) => i !== index));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setProfileImage(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clean form data: convert empty strings to null for optional fields
    const cleanedFormData = {
      ...formData,
      contactPhone: formData.contactPhone || null,
      bio: formData.bio || null,
      industry: formData.industry || null,
      position: formData.position || null,
      yearsOfExperience: formData.yearsOfExperience
        ? parseInt(formData.yearsOfExperience)
        : null,
      linkedInProfile: formData.linkedInProfile || null,
      website: formData.website || null,
    };

    onSubmit(cleanedFormData, companies, profileImage);
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
              Tên hiển thị <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại liên hệ
            </label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chức vụ
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              placeholder="Ví dụ: HR Manager, CEO"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số năm kinh nghiệm
            </label>
            <input
              type="number"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleInputChange}
              min="0"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lĩnh vực
          </label>
          <input
            type="text"
            name="industry"
            value={formData.industry}
            onChange={handleInputChange}
            placeholder="Ví dụ: Công nghệ thông tin, Marketing"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Profile Image */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Ảnh đại diện
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn ảnh đại diện
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="employer-profile-image"
            />
            <label
              htmlFor="employer-profile-image"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md cursor-pointer hover:bg-blue-100"
            >
              <FaCamera />
              <span>Chọn ảnh</span>
            </label>
            {profileImage && (
              <span className="text-sm text-gray-600">{profileImage.name}</span>
            )}
          </div>
        </div>
      </div>

      {/* Companies */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Công ty</h2>
          <button
            type="button"
            onClick={addCompany}
            className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100"
          >
            <FaPlus />
            <span>Thêm công ty</span>
          </button>
        </div>
        <div className="space-y-6">
          {companies.map((company, index) => (
            <div
              key={company.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Công ty {index + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => removeCompany(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Xóa
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên công ty <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={company.name}
                    onChange={(e) =>
                      handleCompanyChange(index, "name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={company.website}
                    onChange={(e) =>
                      handleCompanyChange(index, "website", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lĩnh vực
                  </label>
                  <input
                    type="text"
                    value={company.industry}
                    onChange={(e) =>
                      handleCompanyChange(index, "industry", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quy mô
                  </label>
                  <select
                    value={company.size}
                    onChange={(e) =>
                      handleCompanyChange(index, "size", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn quy mô</option>
                    <option value="1-10">1-10 nhân viên</option>
                    <option value="11-50">11-50 nhân viên</option>
                    <option value="51-200">51-200 nhân viên</option>
                    <option value="201-500">201-500 nhân viên</option>
                    <option value="501-1000">501-1000 nhân viên</option>
                    <option value="1000+">1000+ nhân viên</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Năm thành lập
                  </label>
                  <input
                    type="number"
                    value={company.foundedYear}
                    onChange={(e) =>
                      handleCompanyChange(index, "foundedYear", e.target.value)
                    }
                    min="1800"
                    max={new Date().getFullYear()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email liên hệ
                  </label>
                  <input
                    type="email"
                    value={company.contactEmail}
                    onChange={(e) =>
                      handleCompanyChange(index, "contactEmail", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={company.address}
                  onChange={(e) =>
                    handleCompanyChange(index, "address", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả công ty
                </label>
                <textarea
                  value={company.description}
                  onChange={(e) =>
                    handleCompanyChange(index, "description", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Liên kết</h2>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website cá nhân
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
          placeholder="Hãy giới thiệu về bản thân và kinh nghiệm của bạn..."
          rows={5}
          maxLength={2000}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
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

export default CreateEmployerProfile;
