import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router";
import type {
  JobCreateRequest,
  CategoryDto,
  JobImageCreateRequest,
} from "../../types/job";
import axios from "axios";
import {
  FaBriefcase,
  FaClipboardList,
  FaMoneyBillWave,
  FaUsers,
  FaCalendarAlt,
  FaUserGraduate,
  FaVenusMars,
  FaCogs,
  FaBuilding,
  FaFolderOpen,
  FaImages,
  FaCloudUploadAlt,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaArrowRight,
  FaSpinner,
  FaInfoCircle,
} from "react-icons/fa";

// Progress Step Component
const ProgressStep: React.FC<{
  step: number;
  currentStep: number;
  title: string;
  icon: React.ReactNode;
}> = ({ step, currentStep, title, icon }) => {
  const isActive = currentStep === step;
  const isCompleted = currentStep > step;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`
          w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-all duration-300
          ${isCompleted
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
            : isActive
              ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 scale-110"
              : "bg-gray-100 text-gray-400 border border-gray-200"
          }
        `}
      >
        {isCompleted ? <FaCheck /> : icon}
      </div>
      <span className={`mt-2 text-xs font-medium hidden sm:block ${isActive ? "text-blue-600" : isCompleted ? "text-emerald-600" : "text-gray-400"}`}>
        {title}
      </span>
    </div>
  );
};

// Form Section Card Component
const FormSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  iconBg?: string;
}> = ({ title, icon, children, iconBg = "bg-blue-100 text-blue-600" }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
    <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </span>
        {title}
      </h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

// Input Field Component
const InputField: React.FC<{
  label: string;
  name: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  required?: boolean;
  error?: string;
  min?: string | number;
  max?: string | number;
  rows?: number;
  options?: { value: string; label: string }[];
  helpText?: string;
}> = ({ label, name, value, onChange, type = "text", placeholder, icon, required, error, min, max, rows, options, helpText }) => {
  const inputClasses = `
    w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
    ${icon ? "pl-12" : ""}
    ${error
      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
      : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/20"
    }
    outline-none font-medium text-gray-700 placeholder-gray-400
  `;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        {options ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className={inputClasses}
            required={required}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : rows ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className={inputClasses}
            required={required}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={inputClasses}
            required={required}
            min={min}
            max={max}
          />
        )}
      </div>
      {helpText && !error && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <FaInfoCircle className="text-gray-400" />
          {helpText}
        </p>
      )}
      {error && (
        <p className="text-red-500 text-sm font-medium flex items-center gap-1">
          <FaExclamationTriangle className="text-xs" />
          {error}
        </p>
      )}
    </div>
  );
};

// Image Preview Component
const ImagePreview: React.FC<{
  preview: string;
  index: number;
  onRemove: (index: number) => void;
  isPrimary?: boolean;
}> = ({ preview, index, onRemove, isPrimary }) => (
  <div className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
    <img
      src={preview}
      alt={`Preview ${index + 1}`}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
    />
    {isPrimary && (
      <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg z-10">
        Ảnh chính
      </div>
    )}
    {/* Gradient overlay - placed before button so button stays on top */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    {/* Remove button with z-20 to be above overlay */}
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove(index);
      }}
      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-lg transform hover:scale-110 z-20 cursor-pointer"
    >
      <FaTimes className="text-sm" />
    </button>
  </div>
);

// Employer Profile Required Component
const EmployerProfileRequired: React.FC<{ hasProfile: boolean; hasCompanies: boolean }> = ({ hasProfile, hasCompanies }) => (
  <div className="min-h-[60vh] flex items-center justify-center p-4">
    <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 h-2" />
      <div className="p-8 text-center">
        <div className="w-20 h-20 mx-auto bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 text-4xl mb-6">
          <FaExclamationTriangle />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {!hasProfile ? "Chưa có hồ sơ nhà tuyển dụng" : "Chưa có thông tin công ty"}
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          {!hasProfile
            ? "Để đăng tin tuyển dụng, bạn cần tạo hồ sơ nhà tuyển dụng với thông tin công ty trước."
            : "Để đăng tin tuyển dụng, bạn cần thêm ít nhất một công ty vào hồ sơ nhà tuyển dụng."
          }
        </p>
        <Link
          to="/manage-profile?tab=employer&create=true"
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <FaBuilding />
          {!hasProfile ? "Tạo hồ sơ nhà tuyển dụng" : "Thêm công ty"}
          <FaArrowRight />
        </Link>
      </div>
    </div>
  </div>
);

// Login Required Component
const LoginRequired: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center p-4">
    <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2" />
      <div className="p-8 text-center">
        <div className="w-20 h-20 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-4xl mb-6">
          <FaUsers />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Vui lòng đăng nhập
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Để đăng tin tuyển dụng, bạn cần đăng nhập vào tài khoản của mình.
        </p>
        <Link
          to="/?login=true"
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          Đăng nhập ngay
          <FaArrowRight />
        </Link>
      </div>
    </div>
  </div>
);

const PostJobForm: React.FC = () => {
  const { user, setNotification } = useAuth();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [companies, setCompanies] = useState<{ companyId: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [hasEmployerProfile, setHasEmployerProfile] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<JobCreateRequest>({
    title: "",
    description: "",
    employmentType: "",
    salaryFrom: undefined,
    salaryTo: undefined,
    positionsNeeded: 1,
    positionsFilled: 0,
    deadlineDate: "",
    minAge: undefined,
    maxAge: undefined,
    requiredExperienceYears: undefined,
    requiredDegree: "",
    genderPreference: "Không yêu cầu",
    skillsRequired: "",
    categoryId: "",
    companyId: "",
    images: undefined,
  });

  // Multi-image state
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const remainingSlots = 5 - selectedImages.length;
    const filesToAdd = acceptedFiles.slice(0, remainingSlots);

    if (acceptedFiles.length > remainingSlots) {
      setNotification({
        message: `Chỉ có thể thêm ${remainingSlots} ảnh nữa. Đã bỏ qua ${acceptedFiles.length - remainingSlots} ảnh.`,
        type: "warning",
      });
    }

    // Validate file sizes
    const validFiles = filesToAdd.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setNotification({
          message: `"${file.name}" vượt quá 5MB và đã bị bỏ qua.`,
          type: "error",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setSelectedImages(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, [selectedImages.length, setNotification]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 5,
    disabled: selectedImages.length >= 5,
  });

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const fetchData = async () => {
      // Fetch categories
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/categories`
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }

      // Fetch companies and check employer profile
      if (user) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/profiles/employer/companies`,
            { withCredentials: true }
          );
          setCompanies(response.data);
          setHasEmployerProfile(true);
        } catch (error: any) {
          if (error.response?.status === 404) {
            setHasEmployerProfile(false);
          } else {
            console.error("Error fetching companies:", error);
          }
        }
      }
      setCheckingProfile(false);
    };

    fetchData();
  }, [user]);

  // Update current step based on filled fields
  useEffect(() => {
    if (formData.title && formData.categoryId && formData.companyId) {
      if (formData.description || formData.skillsRequired) {
        if (selectedImages.length > 0) {
          setCurrentStep(4);
        } else {
          setCurrentStep(3);
        }
      } else {
        setCurrentStep(2);
      }
    } else {
      setCurrentStep(1);
    }
  }, [formData, selectedImages]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let processedValue: any = value;
    if (
      ["salaryFrom", "salaryTo", "positionsNeeded", "positionsFilled", "minAge", "maxAge", "requiredExperienceYears"].includes(name)
    ) {
      processedValue = value ? Number(value) : undefined;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (["salaryFrom", "salaryTo"].includes(name)) {
      setErrors((prev) => ({ ...prev, salaryTo: "" }));
    }
    if (["minAge", "maxAge"].includes(name)) {
      setErrors((prev) => ({ ...prev, maxAge: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Tiêu đề là bắt buộc.";
    if (formData.title.length > 400) newErrors.title = "Tiêu đề không được vượt quá 400 ký tự.";
    if (formData.description && formData.description.length > 4000) newErrors.description = "Mô tả không được vượt quá 4000 ký tự.";
    if (formData.employmentType && formData.employmentType.length > 50) newErrors.employmentType = "Loại công việc không được vượt quá 50 ký tự.";
    if (formData.salaryFrom && formData.salaryFrom < 0) newErrors.salaryFrom = "Lương từ phải là số dương.";
    if (formData.salaryTo && formData.salaryTo < 0) newErrors.salaryTo = "Lương đến phải là số dương.";
    if (formData.salaryFrom && formData.salaryTo && formData.salaryFrom > formData.salaryTo) newErrors.salaryTo = "Lương đến phải lớn hơn lương từ.";
    if (formData.positionsNeeded < 1) newErrors.positionsNeeded = "Số lượng cần tuyển phải ít nhất là 1.";
    if (formData.deadlineDate && new Date(formData.deadlineDate) <= new Date()) newErrors.deadlineDate = "Hạn nộp hồ sơ phải là ngày trong tương lai.";
    if (formData.minAge && (formData.minAge < 16 || formData.minAge > 100)) newErrors.minAge = "Tuổi tối thiểu phải từ 16 đến 100.";
    if (formData.maxAge && (formData.maxAge < 16 || formData.maxAge > 100)) newErrors.maxAge = "Tuổi tối đa phải từ 16 đến 100.";
    if (formData.minAge && formData.maxAge && formData.minAge > formData.maxAge) newErrors.maxAge = "Tuổi tối đa phải lớn hơn tuổi tối thiểu.";
    if (formData.requiredExperienceYears && (formData.requiredExperienceYears < 0 || formData.requiredExperienceYears > 50)) newErrors.requiredExperienceYears = "Kinh nghiệm yêu cầu phải từ 0 đến 50 năm.";
    if (formData.skillsRequired && formData.skillsRequired.length > 500) newErrors.skillsRequired = "Kỹ năng yêu cầu không được vượt quá 500 ký tự.";
    if (!formData.categoryId) newErrors.categoryId = "Danh mục là bắt buộc.";
    if (!formData.companyId) newErrors.companyId = "Công ty là bắt buộc.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setNotification({
        message: "Vui lòng kiểm tra lại các trường thông tin.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      let uploadedImages: JobImageCreateRequest[] = [];

      // Upload images if selected
      if (selectedImages.length > 0) {
        setUploadingImages(true);
        try {
          const uploadPromises = selectedImages.map(async (file, index) => {
            const formDataUpload = new FormData();
            formDataUpload.append("file", file);

            const uploadResponse = await axios.post(
              `${import.meta.env.VITE_IMAGES_SERVICE}/upload/job/${user?.userId}`,
              formDataUpload,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );

            return {
              filePath: uploadResponse.data.image_url,
              fileName: uploadResponse.data.file_name,
              fileType: uploadResponse.data.mime_type,
              fileSize: uploadResponse.data.file_size,
              isPrimary: index === 0, // First image is primary
              sortOrder: index,
              isActive: 1,
            } as JobImageCreateRequest;
          });

          uploadedImages = await Promise.all(uploadPromises);
        } catch (uploadError: any) {
          console.error("Error uploading images:", uploadError);
          setNotification({
            message: "Không thể tải lên một số hình ảnh. Vui lòng thử lại.",
            type: "error",
          });
          setLoading(false);
          setUploadingImages(false);
          return;
        }
        setUploadingImages(false);
      }

      // Prepare data for submission
      const submitData = {
        ...formData,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
        deadlineDate: formData.deadlineDate
          ? new Date(formData.deadlineDate).toISOString().split("T")[0]
          : undefined,
      };

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/jobs`,
        submitData,
        { withCredentials: true }
      );

      setNotification({
        message: "🎉 Đăng tin tuyển dụng thành công!",
        type: "success",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        employmentType: "",
        salaryFrom: undefined,
        salaryTo: undefined,
        positionsNeeded: 1,
        positionsFilled: 0,
        deadlineDate: "",
        minAge: undefined,
        maxAge: undefined,
        requiredExperienceYears: undefined,
        requiredDegree: "",
        genderPreference: "Không yêu cầu",
        skillsRequired: "",
        categoryId: "",
        companyId: "",
        images: undefined,
      });
      setSelectedImages([]);
      setImagePreviews([]);
    } catch (error: any) {
      console.error("Error posting job:", error.response?.data || error.message);
      const message = error.response?.data?.message || "Không thể đăng tin. Vui lòng thử lại.";
      setNotification({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (checkingProfile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
            <FaSpinner className="text-blue-600 text-2xl animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Đang kiểm tra hồ sơ...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <LoginRequired />;
  }

  // No employer profile or no companies
  if (!hasEmployerProfile || companies.length === 0) {
    return <EmployerProfileRequired hasProfile={hasEmployerProfile} hasCompanies={companies.length > 0} />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-white/50">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 h-32 sm:h-40 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
              </svg>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3">
                  <FaBriefcase className="text-3xl" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">Đăng tin tuyển dụng</h1>
                <p className="text-white/80 text-sm mt-1">Tìm kiếm ứng viên phù hợp cho công ty của bạn</p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <ProgressStep step={1} currentStep={currentStep} title="Thông tin cơ bản" icon={<FaClipboardList />} />
              <div className="flex-1 h-1 bg-gray-200 mx-2 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ${currentStep >= 2 ? "w-full" : "w-0"}`} />
              </div>
              <ProgressStep step={2} currentStep={currentStep} title="Yêu cầu công việc" icon={<FaCogs />} />
              <div className="flex-1 h-1 bg-gray-200 mx-2 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ${currentStep >= 3 ? "w-full" : "w-0"}`} />
              </div>
              <ProgressStep step={3} currentStep={currentStep} title="Hình ảnh" icon={<FaImages />} />
              <div className="flex-1 h-1 bg-gray-200 mx-2 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r from-pink-500 to-emerald-500 transition-all duration-500 ${currentStep >= 4 ? "w-full" : "w-0"}`} />
              </div>
              <ProgressStep step={4} currentStep={currentStep} title="Hoàn tất" icon={<FaCheck />} />
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <FormSection title="Thông tin cơ bản" icon={<FaClipboardList />} iconBg="bg-blue-100 text-blue-600">
            <div className="space-y-6">
              <InputField
                label="Tiêu đề công việc"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="VD: Tuyển Lập trình viên Full-stack"
                icon={<FaBriefcase />}
                required
                error={errors.title}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Công ty"
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleChange}
                  icon={<FaBuilding />}
                  required
                  error={errors.companyId}
                  options={[
                    { value: "", label: "Chọn công ty" },
                    ...companies.map(c => ({ value: c.companyId, label: c.name }))
                  ]}
                />
                <InputField
                  label="Danh mục ngành nghề"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  icon={<FaFolderOpen />}
                  required
                  error={errors.categoryId}
                  options={[
                    { value: "", label: "Chọn danh mục" },
                    ...categories.map(c => ({ value: c.categoryId, label: c.name }))
                  ]}
                />
              </div>

              <InputField
                label="Loại hình công việc"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                placeholder="VD: Toàn thời gian, Bán thời gian, Remote..."
                error={errors.employmentType}
              />

              <InputField
                label="Mô tả công việc"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả chi tiết về công việc, trách nhiệm, quyền lợi..."
                rows={5}
                error={errors.description}
                helpText="Mô tả chi tiết giúp thu hút ứng viên phù hợp hơn"
              />
            </div>
          </FormSection>

          {/* Salary & Positions */}
          <FormSection title="Mức lương & Vị trí" icon={<FaMoneyBillWave />} iconBg="bg-emerald-100 text-emerald-600">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Lương từ (VNĐ)"
                  name="salaryFrom"
                  value={formData.salaryFrom || ""}
                  onChange={handleChange}
                  type="number"
                  placeholder="VD: 15000000"
                  icon={<FaMoneyBillWave />}
                  error={errors.salaryFrom}
                />
                <InputField
                  label="Lương đến (VNĐ)"
                  name="salaryTo"
                  value={formData.salaryTo || ""}
                  onChange={handleChange}
                  type="number"
                  placeholder="VD: 25000000"
                  icon={<FaMoneyBillWave />}
                  error={errors.salaryTo}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Số lượng cần tuyển"
                  name="positionsNeeded"
                  value={formData.positionsNeeded}
                  onChange={handleChange}
                  type="number"
                  min={1}
                  icon={<FaUsers />}
                  required
                  error={errors.positionsNeeded}
                />
                <InputField
                  label="Hạn nộp hồ sơ"
                  name="deadlineDate"
                  value={formData.deadlineDate}
                  onChange={handleChange}
                  type="date"
                  icon={<FaCalendarAlt />}
                  error={errors.deadlineDate}
                />
              </div>
            </div>
          </FormSection>

          {/* Requirements */}
          <FormSection title="Yêu cầu ứng viên" icon={<FaUserGraduate />} iconBg="bg-purple-100 text-purple-600">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField
                  label="Tuổi tối thiểu"
                  name="minAge"
                  value={formData.minAge || ""}
                  onChange={handleChange}
                  type="number"
                  min={16}
                  max={100}
                  placeholder="18"
                  error={errors.minAge}
                />
                <InputField
                  label="Tuổi tối đa"
                  name="maxAge"
                  value={formData.maxAge || ""}
                  onChange={handleChange}
                  type="number"
                  min={16}
                  max={100}
                  placeholder="35"
                  error={errors.maxAge}
                />
                <InputField
                  label="Kinh nghiệm (năm)"
                  name="requiredExperienceYears"
                  value={formData.requiredExperienceYears || ""}
                  onChange={handleChange}
                  type="number"
                  min={0}
                  max={50}
                  placeholder="2"
                  error={errors.requiredExperienceYears}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Bằng cấp yêu cầu"
                  name="requiredDegree"
                  value={formData.requiredDegree}
                  onChange={handleChange}
                  icon={<FaUserGraduate />}
                  options={[
                    { value: "", label: "Chọn bằng cấp" },
                    { value: "Cấp 3", label: "Cấp 3" },
                    { value: "Trung cấp", label: "Trung cấp" },
                    { value: "Cao đẳng", label: "Cao đẳng" },
                    { value: "Đại học", label: "Đại học" },
                    { value: "Thạc sĩ", label: "Thạc sĩ" },
                    { value: "Tiến sĩ", label: "Tiến sĩ" },
                  ]}
                />
                <InputField
                  label="Ưu tiên giới tính"
                  name="genderPreference"
                  value={formData.genderPreference}
                  onChange={handleChange}
                  icon={<FaVenusMars />}
                  options={[
                    { value: "Không yêu cầu", label: "Không yêu cầu" },
                    { value: "Nam", label: "Nam" },
                    { value: "Nữ", label: "Nữ" },
                  ]}
                />
              </div>

              <InputField
                label="Kỹ năng yêu cầu"
                name="skillsRequired"
                value={formData.skillsRequired}
                onChange={handleChange}
                placeholder="VD: ReactJS, Node.js, TypeScript, Git, Problem solving..."
                rows={3}
                error={errors.skillsRequired}
                helpText="Liệt kê các kỹ năng cách nhau bởi dấu phẩy"
              />
            </div>
          </FormSection>

          {/* Image Upload */}
          <FormSection title="Hình ảnh công việc" icon={<FaImages />} iconBg="bg-pink-100 text-pink-600">
            <div className="space-y-6">
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`
                  border-3 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
                  ${isDragActive
                    ? "border-blue-500 bg-blue-50 scale-[1.02]"
                    : selectedImages.length >= 5
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                      : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50"
                  }
                `}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-4 shadow-lg">
                  <FaCloudUploadAlt />
                </div>
                {selectedImages.length >= 5 ? (
                  <div>
                    <p className="text-gray-600 font-semibold">Đã đạt giới hạn 5 ảnh</p>
                    <p className="text-gray-400 text-sm mt-1">Xóa ảnh để thêm ảnh mới</p>
                  </div>
                ) : isDragActive ? (
                  <div>
                    <p className="text-blue-600 font-semibold text-lg">Thả ảnh tại đây...</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 font-semibold mb-1">
                      Kéo thả hoặc <span className="text-blue-600">bấm để chọn ảnh</span>
                    </p>
                    <p className="text-gray-400 text-sm">
                      PNG, JPG, JPEG, WebP (tối đa 5MB/ảnh, tối đa 5 ảnh)
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Còn lại: {5 - selectedImages.length} ảnh
                    </p>
                  </div>
                )}
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <ImagePreview
                      key={index}
                      preview={preview}
                      index={index}
                      onRemove={removeImage}
                      isPrimary={index === 0}
                    />
                  ))}
                </div>
              )}
            </div>
          </FormSection>

          {/* Submit Button */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3
                ${loading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white hover:shadow-xl hover:shadow-purple-500/30 transform hover:-translate-y-1"
                }
              `}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  {uploadingImages ? "Đang tải ảnh..." : "Đang đăng tin..."}
                </>
              ) : (
                <>
                  <FaBriefcase />
                  Đăng tin tuyển dụng
                  <FaArrowRight />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJobForm;
