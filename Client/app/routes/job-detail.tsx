import MainLayout from "../layout/MainLayout";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

interface JobDetail {
  jobId: string;
  jobGuid: string;
  title: string;
  description?: string;
  employmentType?: string;
  salaryFrom?: number;
  salaryTo?: number;
  createdAt: string;
  hiringStatus?: string;
  positionsNeeded?: number;
  positionsFilled?: number;
  deadlineDate?: string;
  minAge?: number;
  maxAge?: number;
  requiredExperienceYears?: number;
  requiredDegree?: string;
  genderPreference?: string;
  skillsRequired?: string;
  categoryId?: string;
  images?: JobImage[];
  companyName?: string;
  companyLocation?: string;
  employerProfile?: EmployerProfile;
  company?: Company;
}

interface EmployerProfile {
  employerId: string;
  userId: string;
  displayName?: string;
  contactPhone?: string;
  bio?: string;
  industry?: string;
  position?: string;
  yearsOfExperience?: number;
  linkedInProfile?: string;
  website?: string;
  createdAt: string;
  updatedAt?: string;
  images?: EmployerProfileImage[];
  companies?: Company[];
}

interface EmployerProfileImage {
  imageId: string;
  employerId: string;
  filePath: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  caption?: string;
  sortOrder: number;
  isPrimary: boolean;
  isActive: boolean;
  uploadedByUserId?: string;
  createdAt: string;
  updatedAt?: string;
}

interface Company {
  companyId: string;
  name: string;
  companyCode?: string;
  website?: string;
  description?: string;
  industry?: string;
  companySize?: string;
  foundedYear?: number;
  logoURL?: string;
  address?: string;
  contactEmail?: string;
  createdAt: string;
  updatedAt?: string;
  images?: CompanyImage[];
}

interface CompanyImage {
  companyImageId: string;
  companyId: string;
  filePath: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  caption?: string;
  sortOrder: number;
  isPrimary: boolean;
  isActive: boolean;
  uploadedByUserId?: string;
  createdAt: string;
  updatedAt?: string;
}

interface JobImage {
  jobImageId: string;
  jobId: string;
  filePath: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  caption?: string;
  sortOrder: number;
  isPrimary: boolean;
  isActive: boolean;
  uploadedByUserId?: string;
  createdAt: string;
  updatedAt?: string;
}

export function meta() {
  return [
    { title: "JobsViet - Job Details" },
    {
      name: "description",
      content: "View detailed job information on JobsViet!",
    },
  ];
}

export default function JobDetail() {
  const { jobGuid } = useParams<{ jobGuid: string }>();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetail = async () => {
      if (!jobGuid) return;

      setLoading(true);
      setError(null);
      try {
        const baseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5174/api/v1.0";
        const response = await fetch(`${baseUrl}/jobs/${jobGuid}`);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch job details: ${response.statusText}`
          );
        }

        const jobData: JobDetail = await response.json();
        setJob(jobData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [jobGuid]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading job details...</div>
        </div>
      </MainLayout>
    );
  }

  if (error || !job) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            Error: {error || "Job not found"}
          </div>
        </div>
      </MainLayout>
    );
  }

  const primaryImage =
    job.images?.find((img) => img.isPrimary) || job.images?.[0];
  const imageUrl = primaryImage
    ? `${import.meta.env.VITE_IMAGES_SERVICE || "http://127.0.0.1:8000"}${primaryImage.filePath}`
    : "https://via.placeholder.com/400x300?text=Job+Image";

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Job Image */}
          <div className="w-full h-64 md:h-80">
            <img
              src={imageUrl}
              alt={job.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Job Details */}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {job.title}
            </h1>

            {/* Company Info */}
            {job.company && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Thông tin công ty
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    {job.company.logoURL && (
                      <img
                        src={job.company.logoURL}
                        alt={job.company.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {job.company.name}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        {job.company.industry && (
                          <p>
                            <strong>Lĩnh vực:</strong> {job.company.industry}
                          </p>
                        )}
                        {job.company.companySize && (
                          <p>
                            <strong>Quy mô:</strong> {job.company.companySize}
                          </p>
                        )}
                        {job.company.foundedYear && (
                          <p>
                            <strong>Năm thành lập:</strong>{" "}
                            {job.company.foundedYear}
                          </p>
                        )}
                        {job.company.address && (
                          <p>
                            <strong>Địa chỉ:</strong> {job.company.address}
                          </p>
                        )}
                        {job.company.website && (
                          <p>
                            <strong>Website:</strong>{" "}
                            <a
                              href={job.company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {job.company.website}
                            </a>
                          </p>
                        )}
                        {job.company.contactEmail && (
                          <p>
                            <strong>Email:</strong> {job.company.contactEmail}
                          </p>
                        )}
                      </div>
                      {job.company.description && (
                        <p className="text-gray-700 mt-2 whitespace-pre-wrap">
                          {job.company.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recruiter Profile */}
            {job.employerProfile && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Thông tin nhà tuyển dụng
                </h2>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    {job.employerProfile.images &&
                      job.employerProfile.images.length > 0 && (
                        <img
                          src={`${import.meta.env.VITE_IMAGES_SERVICE || "http://127.0.0.1:8000"}${job.employerProfile.images.find((img) => img.isPrimary)?.filePath || job.employerProfile.images[0].filePath}`}
                          alt={job.employerProfile.displayName || "Recruiter"}
                          className="w-16 h-16 object-cover rounded-full"
                        />
                      )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {job.employerProfile.displayName || "Chưa cập nhật"}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        {job.employerProfile.position && (
                          <p>
                            <strong>Chức vụ:</strong>{" "}
                            {job.employerProfile.position}
                          </p>
                        )}
                        {job.employerProfile.industry && (
                          <p>
                            <strong>Lĩnh vực:</strong>{" "}
                            {job.employerProfile.industry}
                          </p>
                        )}
                        {job.employerProfile.yearsOfExperience && (
                          <p>
                            <strong>Kinh nghiệm:</strong>{" "}
                            {job.employerProfile.yearsOfExperience} năm
                          </p>
                        )}
                        {job.employerProfile.contactPhone && (
                          <p>
                            <strong>Số điện thoại:</strong>{" "}
                            {job.employerProfile.contactPhone}
                          </p>
                        )}
                        {job.employerProfile.website && (
                          <p>
                            <strong>Website:</strong>{" "}
                            <a
                              href={job.employerProfile.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {job.employerProfile.website}
                            </a>
                          </p>
                        )}
                        {job.employerProfile.linkedInProfile && (
                          <p>
                            <strong>LinkedIn:</strong>{" "}
                            <a
                              href={job.employerProfile.linkedInProfile}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {job.employerProfile.linkedInProfile}
                            </a>
                          </p>
                        )}
                      </div>
                      {job.employerProfile.bio && (
                        <p className="text-gray-700 mt-2 whitespace-pre-wrap">
                          {job.employerProfile.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Job Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Mô tả công việc
              </h2>
              <p className="text-gray-700 whitespace-pre-line">
                {job.description || "Không có mô tả"}
              </p>
            </div>

            {/* Job Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Thông tin tuyển dụng
                </h3>
                <div className="space-y-2">
                  <p>
                    <strong>Loại công việc:</strong>{" "}
                    {job.employmentType || "Không xác định"}
                  </p>
                  <p>
                    <strong>Mức lương:</strong>{" "}
                    {job.salaryFrom && job.salaryTo
                      ? `${job.salaryFrom.toLocaleString()} - ${job.salaryTo.toLocaleString()} VND`
                      : "Thỏa thuận"}
                  </p>
                  <p>
                    <strong>Số lượng cần tuyển:</strong>{" "}
                    {job.positionsNeeded || "Không xác định"}
                  </p>
                  <p>
                    <strong>Đã tuyển:</strong> {job.positionsFilled || 0}
                  </p>
                  <p>
                    <strong>Hạn nộp hồ sơ:</strong>{" "}
                    {job.deadlineDate
                      ? new Date(job.deadlineDate).toLocaleDateString("vi-VN")
                      : "Không giới hạn"}
                  </p>
                  <p>
                    <strong>Trạng thái tuyển dụng:</strong>{" "}
                    {job.hiringStatus || "Đang tuyển"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Yêu cầu ứng viên
                </h3>
                <div className="space-y-2">
                  <p>
                    <strong>Độ tuổi:</strong>{" "}
                    {job.minAge && job.maxAge
                      ? `${job.minAge} - ${job.maxAge} tuổi`
                      : "Không yêu cầu"}
                  </p>
                  <p>
                    <strong>Kinh nghiệm:</strong>{" "}
                    {job.requiredExperienceYears
                      ? `${job.requiredExperienceYears} năm`
                      : "Không yêu cầu"}
                  </p>
                  <p>
                    <strong>Bằng cấp:</strong>{" "}
                    {job.requiredDegree || "Không yêu cầu"}
                  </p>
                  <p>
                    <strong>Giới tính:</strong>{" "}
                    {job.genderPreference || "Không yêu cầu"}
                  </p>
                  <p>
                    <strong>Kỹ năng:</strong>{" "}
                    {job.skillsRequired || "Không yêu cầu"}
                  </p>
                </div>
              </div>
            </div>

            {/* Created Date */}
            <div className="text-sm text-gray-500">
              <p>
                <strong>Ngày đăng:</strong>{" "}
                {new Date(job.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
