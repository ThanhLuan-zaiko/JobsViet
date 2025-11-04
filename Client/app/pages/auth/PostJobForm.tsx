import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import type {
  JobCreateRequest,
  CategoryDto,
  JobImageCreateRequest,
} from "../../types/job";
import axios from "axios";

const PostJobForm: React.FC = () => {
  const { user, setNotification } = useAuth();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [companies, setCompanies] = useState<
    { companyId: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
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
    image: undefined,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/categories`
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setNotification({
          message: "Không thể tải danh mục.",
          type: "error",
        });
      }
    };

    // Fetch companies from API
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/profiles/employer/companies`,
          { withCredentials: true }
        );
        setCompanies(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setNotification({
          message: "Không thể tải công ty.",
          type: "error",
        });
      }
    };

    fetchCategories();
    fetchCompanies();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    let processedValue: any = value;
    if (
      [
        "salaryFrom",
        "salaryTo",
        "positionsNeeded",
        "positionsFilled",
        "minAge",
        "maxAge",
        "requiredExperienceYears",
      ].includes(name)
    ) {
      processedValue = value ? Number(value) : undefined;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    // Clear related errors
    if (["salaryFrom", "salaryTo"].includes(name)) {
      setErrors((prev) => ({ ...prev, salaryTo: "" }));
    }
    if (["minAge", "maxAge"].includes(name)) {
      setErrors((prev) => ({ ...prev, maxAge: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Tiêu đề là bắt buộc.";
    if (formData.title.length > 400)
      newErrors.title = "Tiêu đề không được vượt quá 400 ký tự.";
    if (formData.description && formData.description.length > 4000)
      newErrors.description = "Mô tả không được vượt quá 4000 ký tự.";
    if (formData.employmentType && formData.employmentType.length > 50)
      newErrors.employmentType = "Loại công việc không được vượt quá 50 ký tự.";
    if (formData.salaryFrom && formData.salaryFrom < 0)
      newErrors.salaryFrom = "Lương từ phải là số dương.";
    if (formData.salaryTo && formData.salaryTo < 0)
      newErrors.salaryTo = "Lương đến phải là số dương.";
    if (
      formData.salaryFrom &&
      formData.salaryTo &&
      formData.salaryFrom > formData.salaryTo
    )
      newErrors.salaryTo = "Lương đến phải lớn hơn lương từ.";
    if (formData.positionsNeeded < 1)
      newErrors.positionsNeeded = "Số lượng cần tuyển phải ít nhất là 1.";
    if (formData.deadlineDate && new Date(formData.deadlineDate) <= new Date())
      newErrors.deadlineDate = "Hạn nộp hồ sơ phải là ngày trong tương lai.";
    if (formData.minAge && (formData.minAge < 16 || formData.minAge > 100))
      newErrors.minAge = "Tuổi tối thiểu phải từ 16 đến 100.";
    if (formData.maxAge && (formData.maxAge < 16 || formData.maxAge > 100))
      newErrors.maxAge = "Tuổi tối đa phải từ 16 đến 100.";
    if (formData.minAge && formData.maxAge && formData.minAge > formData.maxAge)
      newErrors.maxAge = "Tuổi tối đa phải lớn hơn tuổi tối thiểu.";
    if (
      formData.requiredExperienceYears &&
      (formData.requiredExperienceYears < 0 ||
        formData.requiredExperienceYears > 50)
    )
      newErrors.requiredExperienceYears =
        "Kinh nghiệm yêu cầu phải từ 0 đến 50 năm.";
    // No validation needed for requiredDegree as it's now a select dropdown
    if (formData.skillsRequired && formData.skillsRequired.length > 500)
      newErrors.skillsRequired =
        "Kỹ năng yêu cầu không được vượt quá 500 ký tự.";
    if (!formData.categoryId) newErrors.categoryId = "Danh mục là bắt buộc.";
    if (!formData.companyId) newErrors.companyId = "Công ty là bắt buộc.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      let imageData: JobImageCreateRequest | undefined = undefined;

      // Upload image if selected
      if (selectedImage && !uploadError) {
        setUploadingImage(true);
        try {
          const formDataUpload = new FormData();
          formDataUpload.append("file", selectedImage);

          const uploadResponse = await axios.post(
            `${import.meta.env.VITE_IMAGES_SERVICE}/upload/job/${user?.userId}`,
            formDataUpload,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          imageData = {
            filePath: uploadResponse.data.image_url,
            fileName: uploadResponse.data.file_name,
            fileType: uploadResponse.data.mime_type,
            fileSize: uploadResponse.data.file_size,
            isPrimary: true,
            sortOrder: 0,
            isActive: 1,
          };
        } catch (uploadError: any) {
          console.error("Error uploading image:", uploadError);
          setUploadError(true);
          setNotification({
            message: "Không thể tải lên hình ảnh. Vui lòng thử lại.",
            type: "error",
          });
          setLoading(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      // Prepare data for submission - ensure categoryId is a valid GUID
      const submitData = {
        ...formData,
        image: imageData,
        categoryId: formData.categoryId, // Already a string GUID from the select
        deadlineDate: formData.deadlineDate
          ? new Date(formData.deadlineDate).toISOString().split("T")[0]
          : undefined,
      };

      console.log("Submitting job data:", submitData); // Debug log

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/jobs`,
        submitData,
        { withCredentials: true }
      );

      setNotification({
        message: "Đăng tin thành công!",
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
        image: undefined,
      });
      setSelectedImage(null);
      setImagePreview(null);
      setUploadError(false);
    } catch (error: any) {
      console.error(
        "Error posting job:",
        error.response?.data || error.message
      );
      const message = error.response?.data?.message || "Không thể đăng tin.";
      setNotification({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Đăng nhập để sử dụng tính năng này!</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Đăng tin tuyển dụng</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tiêu đề *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mô tả
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description}</p>
          )}
        </div>

        {/* Employment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Loại công việc
          </label>
          <input
            type="text"
            name="employmentType"
            value={formData.employmentType}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
          {errors.employmentType && (
            <p className="text-red-500 text-sm">{errors.employmentType}</p>
          )}
        </div>

        {/* Salary */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lương từ
            </label>
            <input
              type="number"
              name="salaryFrom"
              value={formData.salaryFrom || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            {errors.salaryFrom && (
              <p className="text-red-500 text-sm">{errors.salaryFrom}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lương đến
            </label>
            <input
              type="number"
              name="salaryTo"
              value={formData.salaryTo || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            {errors.salaryTo && (
              <p className="text-red-500 text-sm">{errors.salaryTo}</p>
            )}
          </div>
        </div>

        {/* Positions Needed */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Số lượng cần tuyển *
          </label>
          <input
            type="number"
            name="positionsNeeded"
            value={formData.positionsNeeded}
            onChange={handleChange}
            min="1"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
          {errors.positionsNeeded && (
            <p className="text-red-500 text-sm">{errors.positionsNeeded}</p>
          )}
        </div>

        {/* Positions Filled */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Số lượng đã tuyển
          </label>
          <input
            type="number"
            name="positionsFilled"
            value={formData.positionsFilled}
            onChange={handleChange}
            min="0"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
          {errors.positionsFilled && (
            <p className="text-red-500 text-sm">{errors.positionsFilled}</p>
          )}
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Hạn nộp hồ sơ
          </label>
          <input
            type="date"
            name="deadlineDate"
            value={formData.deadlineDate}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
          {errors.deadlineDate && (
            <p className="text-red-500 text-sm">{errors.deadlineDate}</p>
          )}
        </div>

        {/* Age Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tuổi tối thiểu
            </label>
            <input
              type="number"
              name="minAge"
              value={formData.minAge || ""}
              onChange={handleChange}
              min="16"
              max="100"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            {errors.minAge && (
              <p className="text-red-500 text-sm">{errors.minAge}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tuổi tối đa
            </label>
            <input
              type="number"
              name="maxAge"
              value={formData.maxAge || ""}
              onChange={handleChange}
              min="16"
              max="100"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            {errors.maxAge && (
              <p className="text-red-500 text-sm">{errors.maxAge}</p>
            )}
          </div>
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Kinh nghiệm yêu cầu (năm)
          </label>
          <input
            type="number"
            name="requiredExperienceYears"
            value={formData.requiredExperienceYears || ""}
            onChange={handleChange}
            min="0"
            max="50"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
          {errors.requiredExperienceYears && (
            <p className="text-red-500 text-sm">
              {errors.requiredExperienceYears}
            </p>
          )}
        </div>

        {/* Degree */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bằng cấp yêu cầu
          </label>
          <select
            name="requiredDegree"
            value={formData.requiredDegree}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Chọn bằng cấp</option>
            <option value="Cấp 3">Cấp 3</option>
            <option value="Trung cấp">Trung cấp</option>
            <option value="Cao đẳng">Cao đẳng</option>
            <option value="Đại học">Đại học</option>
            <option value="Thạc sĩ">Thạc sĩ</option>
            <option value="Tiến sĩ">Tiến sĩ</option>
          </select>
          {errors.requiredDegree && (
            <p className="text-red-500 text-sm">{errors.requiredDegree}</p>
          )}
        </div>

        {/* Gender Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ưu tiên giới tính
          </label>
          <select
            name="genderPreference"
            value={formData.genderPreference}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="Không yêu cầu">Không yêu cầu</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Kỹ năng yêu cầu
          </label>
          <textarea
            name="skillsRequired"
            value={formData.skillsRequired}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
          {errors.skillsRequired && (
            <p className="text-red-500 text-sm">{errors.skillsRequired}</p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Hình ảnh công việc
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            disabled={uploadingImage}
          />
          {uploadingImage && (
            <p className="text-blue-500 text-sm">Đang tải lên hình ảnh...</p>
          )}
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-md"
              />
            </div>
          )}
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Công ty *
          </label>
          <select
            name="companyId"
            value={formData.companyId}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="">Chọn công ty</option>
            {companies.map((company) => (
              <option key={company.companyId} value={company.companyId}>
                {company.name}
              </option>
            ))}
          </select>
          {errors.companyId && (
            <p className="text-red-500 text-sm">{errors.companyId}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Danh mục *
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="">Chọn danh mục</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-red-500 text-sm">{errors.categoryId}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Đang đăng..." : "Đăng tin"}
        </button>
      </form>
    </div>
  );
};

export default PostJobForm;
