import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import type { JobCreateRequest, CategoryDto } from "../../types/job";
import axios from "axios";

const PostJobForm: React.FC = () => {
  const { user, setNotification } = useAuth();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<JobCreateRequest>({
    title: "",
    description: "",
    employmentType: "",
    salaryFrom: undefined,
    salaryTo: undefined,
    positionsNeeded: 1,
    deadlineDate: "",
    minAge: undefined,
    maxAge: undefined,
    requiredExperienceYears: undefined,
    requiredDegree: "",
    genderPreference: "Không yêu cầu",
    skillsRequired: "",
    categoryId: "",
    companyId: "",
  });

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
          message: "Failed to load categories.",
          type: "error",
        });
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (formData.title.length > 400)
      newErrors.title = "Title cannot exceed 400 characters.";
    if (formData.description && formData.description.length > 4000)
      newErrors.description = "Description cannot exceed 4000 characters.";
    if (formData.employmentType && formData.employmentType.length > 50)
      newErrors.employmentType = "Employment type cannot exceed 50 characters.";
    if (formData.salaryFrom && formData.salaryFrom < 0)
      newErrors.salaryFrom = "Salary from must be positive.";
    if (formData.salaryTo && formData.salaryTo < 0)
      newErrors.salaryTo = "Salary to must be positive.";
    if (
      formData.salaryFrom &&
      formData.salaryTo &&
      formData.salaryFrom > formData.salaryTo
    )
      newErrors.salaryTo = "Salary to must be greater than salary from.";
    if (formData.positionsNeeded < 1)
      newErrors.positionsNeeded = "Positions needed must be at least 1.";
    if (formData.deadlineDate && new Date(formData.deadlineDate) <= new Date())
      newErrors.deadlineDate = "Deadline must be in the future.";
    if (formData.minAge && (formData.minAge < 16 || formData.minAge > 100))
      newErrors.minAge = "Min age must be between 16 and 100.";
    if (formData.maxAge && (formData.maxAge < 16 || formData.maxAge > 100))
      newErrors.maxAge = "Max age must be between 16 and 100.";
    if (formData.minAge && formData.maxAge && formData.minAge > formData.maxAge)
      newErrors.maxAge = "Max age must be greater than min age.";
    if (
      formData.requiredExperienceYears &&
      (formData.requiredExperienceYears < 0 ||
        formData.requiredExperienceYears > 50)
    )
      newErrors.requiredExperienceYears =
        "Experience years must be between 0 and 50.";
    if (formData.requiredDegree && formData.requiredDegree.length > 100)
      newErrors.requiredDegree =
        "Required degree cannot exceed 100 characters.";
    if (formData.skillsRequired && formData.skillsRequired.length > 500)
      newErrors.skillsRequired =
        "Skills required cannot exceed 500 characters.";
    if (!formData.categoryId) newErrors.categoryId = "Category is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/jobs`,
        formData,
        { withCredentials: true }
      );

      setNotification({
        message: "Job posted successfully! It will be reviewed by moderators.",
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
        deadlineDate: "",
        minAge: undefined,
        maxAge: undefined,
        requiredExperienceYears: undefined,
        requiredDegree: "",
        genderPreference: "Không yêu cầu",
        skillsRequired: "",
        categoryId: "",
        companyId: "",
      });
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to post job.";
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
          <input
            type="text"
            name="requiredDegree"
            value={formData.requiredDegree}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
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
