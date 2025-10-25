import React, { useState, useEffect } from "react";
import { FaUser, FaBuilding, FaCamera, FaSave, FaPlus } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import Notification from "../../components/Message/Notification";

const ManageProfile: React.FC = () => {
  const { user, setNotification } = useAuth();

  // Check if user is logged in
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Vui lòng đăng nhập
          </h2>
          <p className="text-gray-600">
            Bạn cần đăng nhập để sử dụng chức năng quản lý hồ sơ.
          </p>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<"candidate" | "employer">(
    "candidate"
  );
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [employerProfile, setEmployerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load existing profiles on component mount
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const [candidateRes, employerRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/profiles/candidate`, {
            withCredentials: true,
          }),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/profiles/employer`, {
            withCredentials: true,
          }),
        ]);

        if (candidateRes.data) {
          setCandidateProfile(candidateRes.data);
        }
        if (employerRes.data) {
          setEmployerProfile(employerRes.data);
        }
      } catch (error) {
        console.error("Error loading profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, []);

  const handleCandidateSubmit = async (formData: any) => {
    setSaving(true);
    try {
      const method = candidateProfile ? "put" : "post";
      const response = await axios[method](
        `${import.meta.env.VITE_API_BASE_URL}/profiles/candidate`,
        formData,
        { withCredentials: true }
      );
      setCandidateProfile(response.data);
      setNotification({
        type: "success",
        message: "Hồ sơ ứng cử viên đã được lưu thành công!",
      });
    } catch (error: any) {
      console.error("Error saving candidate profile:", error);
      setNotification({
        type: "error",
        message: error.response?.data?.message || "Có lỗi xảy ra khi lưu hồ sơ",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEmployerSubmit = async (formData: any, companies: any[]) => {
    setSaving(true);
    try {
      // Save employer profile
      const method = employerProfile ? "put" : "post";
      const employerResponse = await axios[method](
        `${import.meta.env.VITE_API_BASE_URL}/profiles/employer`,
        formData,
        { withCredentials: true }
      );
      setEmployerProfile(employerResponse.data);

      // Save companies
      for (const company of companies) {
        if (company.id.startsWith("temp-")) {
          // New company
          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/profiles/company`,
            company,
            { withCredentials: true }
          );
        } else {
          // Update existing company
          await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/profiles/company/${company.id}`,
            company,
            { withCredentials: true }
          );
        }
      }

      setNotification({
        type: "success",
        message: "Hồ sơ nhà tuyển dụng đã được lưu thành công!",
      });
    } catch (error: any) {
      console.error("Error saving employer profile:", error);
      setNotification({
        type: "error",
        message: error.response?.data?.message || "Có lỗi xảy ra khi lưu hồ sơ",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Đang tải...</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Quản lý hồ sơ</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("candidate")}
          className={`flex items-center space-x-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "candidate"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FaUser />
          <span>Hồ sơ Ứng cử viên</span>
        </button>
        <button
          onClick={() => setActiveTab("employer")}
          className={`flex items-center space-x-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "employer"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FaBuilding />
          <span>Hồ sơ Nhà tuyển dụng</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "candidate" && (
        <CandidateProfileTab
          profile={candidateProfile}
          onSubmit={handleCandidateSubmit}
          saving={saving}
        />
      )}
      {activeTab === "employer" && (
        <EmployerProfileTab
          profile={employerProfile}
          onSubmit={handleEmployerSubmit}
          saving={saving}
        />
      )}
    </div>
  );
};

const CandidateProfileTab: React.FC<{
  profile: any;
  onSubmit: (formData: any) => void;
  saving: boolean;
}> = ({ profile, onSubmit, saving }) => {
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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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

const EmployerProfileTab: React.FC<{
  profile: any;
  onSubmit: (formData: any, companies: any[]) => void;
  saving: boolean;
}> = ({ profile, onSubmit, saving }) => {
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
    onSubmit(formData, companies);
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

export default ManageProfile;
