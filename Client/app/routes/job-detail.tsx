import MainLayout from "../layout/MainLayout";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import {
  FaSpinner,
  FaBriefcase,
  FaMoneyBillWave,
  FaUsers,
  FaCalendarAlt,
  FaUserGraduate,
  FaVenusMars,
  FaCogs,
  FaBuilding,
  FaMapMarkerAlt,
  FaGlobe,
  FaEnvelope,
  FaPhone,
  FaLinkedin,
  FaUserTie,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaShareAlt,
  FaHeart,
  FaRegHeart,
  FaImages,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import axios from "axios";

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
  role?: string;
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

// Info Card Component
const InfoCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBg?: string;
}> = ({ icon, label, value, iconBg = "bg-blue-100 text-blue-600" }) => (
  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-gray-900 font-semibold truncate">{value}</p>
    </div>
  </div>
);

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    OPEN: { bg: "bg-emerald-100", text: "text-emerald-700", icon: <FaCheckCircle /> },
    CLOSED: { bg: "bg-red-100", text: "text-red-700", icon: <FaTimesCircle /> },
    PAUSED: { bg: "bg-amber-100", text: "text-amber-700", icon: <FaClock /> },
  };

  const config = statusConfig[status.toUpperCase()] || statusConfig.OPEN;

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${config.bg} ${config.text}`}>
      {config.icon}
      {status === "OPEN" ? "Đang tuyển" : status === "CLOSED" ? "Đã đóng" : status}
    </span>
  );
};

// Image Gallery Modal
const ImageGalleryModal: React.FC<{
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}> = ({ images, currentIndex, onClose, onPrev, onNext }) => (
  <div
    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
    onClick={onClose}
  >
    <button
      className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10"
      onClick={onClose}
    >
      <FaTimes />
    </button>
    {images.length > 1 && (
      <>
        <button
          className="absolute left-4 text-white text-4xl hover:text-gray-300 z-10 p-2"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
        >
          <FaChevronLeft />
        </button>
        <button
          className="absolute right-4 text-white text-4xl hover:text-gray-300 z-10 p-2"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
        >
          <FaChevronRight />
        </button>
      </>
    )}
    <img
      src={images[currentIndex]}
      alt={`Image ${currentIndex + 1}`}
      className="max-w-full max-h-[90vh] object-contain rounded-lg"
      onClick={(e) => e.stopPropagation()}
    />
    <div className="absolute bottom-4 text-white text-sm">
      {currentIndex + 1} / {images.length}
    </div>
  </div>
);

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
  const [applying, setApplying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const { user, setNotification } = useAuth();

  const imageServiceBase = import.meta.env.VITE_IMAGES_SERVICE || "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchJobDetail = async () => {
      if (!jobGuid) return;

      setLoading(true);
      setError(null);
      try {
        const baseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5174/api/v1.0";
        const response = await axios.get<JobDetail>(`${baseUrl}/jobs/${jobGuid}`);

        setJob(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.statusText || err.message);
        } else {
          setError("An error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [jobGuid]);

  const handleApply = async () => {
    if (!jobGuid) return;

    if (!user) {
      setNotification({
        message: "Bạn phải đăng nhập để ứng tuyển công việc này",
        type: "info",
      });
      return;
    }

    setApplying(true);
    try {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5174/api/v1.0";

      const response = await axios.post(`${baseUrl}/jobs/${jobGuid}/apply`, {}, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = response.data;

      setNotification({
        message: result.message + " Bạn có thể theo dõi trạng thái trong Lịch sử ứng tuyển.",
        type: result.messageType || "success",
      });

    } catch (err) {
      if (axios.isAxiosError(err)) {
        const result = err.response?.data;
        setNotification({
          message: result?.message || "Có lỗi xảy ra khi ứng tuyển",
          type: result?.messageType || "error",
        });
      } else {
        setNotification({
          message: "Không thể kết nối đến server. Vui lòng thử lại.",
          type: "error",
        });
      }
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (from?: number, to?: number) => {
    if (from === undefined && to === undefined) return "Thỏa thuận";
    if (from === null && to === null) return "Thỏa thuận";
    if (from !== undefined && from !== null && to !== undefined && to !== null) {
      if (from === 0 && to === 0) return "Thỏa thuận";
      return `${from.toLocaleString('vi-VN')} - ${to.toLocaleString('vi-VN')} VND`;
    }
    if (from !== undefined && from !== null && from > 0) return `Từ ${from.toLocaleString('vi-VN')} VND`;
    if (to !== undefined && to !== null && to > 0) return `Đến ${to.toLocaleString('vi-VN')} VND`;
    return "Thỏa thuận";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getJobImages = (): string[] => {
    if (!job?.images || job.images.length === 0) return [];
    return job.images.map(img => `${imageServiceBase}${img.filePath}`);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
              <FaSpinner className="text-blue-600 text-2xl animate-spin" />
            </div>
            <p className="text-gray-600 font-medium">Đang tải thông tin...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !job) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden text-center">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 h-2" />
            <div className="p-8">
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-2xl flex items-center justify-center text-red-600 text-4xl mb-6">
                <FaTimesCircle />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Không tìm thấy công việc
              </h2>
              <p className="text-gray-600 mb-8">
                {error || "Công việc này không tồn tại hoặc đã bị xóa."}
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition-colors"
              >
                <FaArrowLeft />
                Quay về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const primaryImage =
    job.images?.find((img) => img.isPrimary) || job.images?.[0];
  const imageUrl = primaryImage
    ? `${imageServiceBase}${primaryImage.filePath}`
    : null;

  const jobImages = getJobImages();

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50/50 pb-12">
        {/* Hero Section with Image */}
        <div className="relative">
          {/* Background Image or Gradient */}
          <div className="h-64 sm:h-80 lg:h-96 relative overflow-hidden">
            {imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt={job.title}
                  className="w-full h-full object-cover"
                  style={{ imageRendering: '-webkit-optimize-contrast' } as React.CSSProperties}
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-black/10 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500" />
            )}

            {/* Back Button */}
            <Link
              to="/"
              className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition-colors"
            >
              <FaArrowLeft />
              <span className="hidden sm:inline">Quay lại</span>
            </Link>

            {/* Actions */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3">
              <button
                onClick={() => setIsSaved(!isSaved)}
                className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition-colors"
              >
                {isSaved ? <FaHeart className="text-red-400" /> : <FaRegHeart />}
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition-colors">
                <FaShareAlt />
              </button>
            </div>
          </div>

          {/* Job Title Card - Overlapping */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
            <div className="bg-white rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Job Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <StatusBadge status={job.hiringStatus || "OPEN"} />
                      {job.employmentType && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {job.employmentType}
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                      {job.title}
                    </h1>

                    {/* Company Quick Info */}
                    {job.company && (
                      <div className="flex items-center gap-4 mb-4">
                        {job.company.logoURL ? (
                          <img
                            src={job.company.logoURL}
                            alt={job.company.name}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-gray-100"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                            {job.company.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{job.company.name}</p>
                          {job.company.address && (
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <FaMapMarkerAlt className="text-xs" />
                              {job.company.address}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Salary Highlight */}
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                        <FaMoneyBillWave className="text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-emerald-600 font-medium">Mức lương</p>
                        <p className="text-xl font-bold text-emerald-700">
                          {formatSalary(job.salaryFrom, job.salaryTo)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Apply Button - Desktop */}
                  <div className="lg:w-72 flex-shrink-0">
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className={`
                        w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3
                        ${applying
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white hover:shadow-xl hover:shadow-purple-500/30 transform hover:-translate-y-1"
                        }
                      `}
                    >
                      {applying ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <FaBriefcase />
                          Ứng tuyển ngay
                        </>
                      )}
                    </button>
                    <p className="text-center text-sm text-gray-500 mt-3">
                      <FaClock className="inline mr-1" />
                      Đăng ngày {formatDate(job.createdAt)}
                    </p>
                    {job.deadlineDate && (
                      <p className="text-center text-sm text-orange-600 font-medium mt-1">
                        <FaCalendarAlt className="inline mr-1" />
                        Hạn nộp: {formatDate(job.deadlineDate)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Job Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Job Description */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                      <FaBriefcase />
                    </span>
                    Mô tả công việc
                  </h2>
                </div>
                <div className="p-6">
                  {job.description ? (
                    <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                      {job.description}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Chưa có mô tả công việc</p>
                  )}
                </div>
              </div>

              {/* Requirements Grid */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                      <FaUserGraduate />
                    </span>
                    Yêu cầu ứng viên
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoCard
                      icon={<FaUserGraduate />}
                      label="Bằng cấp"
                      value={job.requiredDegree || "Không yêu cầu"}
                      iconBg="bg-indigo-100 text-indigo-600"
                    />
                    <InfoCard
                      icon={<FaBriefcase />}
                      label="Kinh nghiệm"
                      value={job.requiredExperienceYears ? `${job.requiredExperienceYears} năm` : "Không yêu cầu"}
                      iconBg="bg-amber-100 text-amber-600"
                    />
                    <InfoCard
                      icon={<FaCalendarAlt />}
                      label="Độ tuổi"
                      value={job.minAge && job.maxAge ? `${job.minAge} - ${job.maxAge} tuổi` : "Không yêu cầu"}
                      iconBg="bg-rose-100 text-rose-600"
                    />
                    <InfoCard
                      icon={<FaVenusMars />}
                      label="Giới tính"
                      value={job.genderPreference || "Không yêu cầu"}
                      iconBg="bg-pink-100 text-pink-600"
                    />
                  </div>

                  {/* Skills */}
                  {job.skillsRequired && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FaCogs className="text-gray-500" />
                        Kỹ năng yêu cầu
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {job.skillsRequired.split(",").map((skill, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 rounded-xl text-sm font-medium border border-blue-100 hover:border-purple-200 transition-colors"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recruitment Info */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <FaUsers />
                    </span>
                    Thông tin tuyển dụng
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoCard
                      icon={<FaUsers />}
                      label="Số lượng cần tuyển"
                      value={`${job.positionsNeeded || 0} người`}
                      iconBg="bg-teal-100 text-teal-600"
                    />
                    <InfoCard
                      icon={<FaCheckCircle />}
                      label="Đã tuyển"
                      value={`${job.positionsFilled || 0} người`}
                      iconBg="bg-green-100 text-green-600"
                    />
                  </div>
                </div>
              </div>

              {/* Job Images Gallery */}
              {jobImages.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
                        <FaImages />
                      </span>
                      Hình ảnh công việc
                      <span className="text-sm font-normal text-gray-500">({jobImages.length} ảnh)</span>
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {jobImages.map((img, index) => (
                        <div
                          key={index}
                          className="aspect-video rounded-xl overflow-hidden cursor-pointer group relative"
                          onClick={() => { setGalleryIndex(index); setShowGallery(true); }}
                        >
                          <img
                            src={img}
                            alt={`Job image ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                            <FaImages className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Company & Employer */}
            <div className="space-y-6">
              {/* Company Card */}
              {job.company && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-4">
                  <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      {job.company.logoURL ? (
                        <img
                          src={job.company.logoURL}
                          alt={job.company.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100 shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                          {job.company.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {job.company.name}
                        </h3>
                        {job.company.industry && (
                          <p className="text-sm text-gray-500">{job.company.industry}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {job.company.companySize && (
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <FaUsers className="text-gray-400 flex-shrink-0" />
                          <span>Quy mô: {job.company.companySize}</span>
                        </div>
                      )}
                      {job.company.foundedYear && (
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <FaCalendarAlt className="text-gray-400 flex-shrink-0" />
                          <span>Thành lập năm {job.company.foundedYear}</span>
                        </div>
                      )}
                      {job.company.address && (
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" />
                          <span className="line-clamp-2">{job.company.address}</span>
                        </div>
                      )}
                      {job.company.website && (
                        <a
                          href={job.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <FaGlobe className="flex-shrink-0" />
                          <span className="truncate">{job.company.website}</span>
                        </a>
                      )}
                      {job.company.contactEmail && (
                        <a
                          href={`mailto:${job.company.contactEmail}`}
                          className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <FaEnvelope className="flex-shrink-0" />
                          <span className="truncate">{job.company.contactEmail}</span>
                        </a>
                      )}
                    </div>

                    {job.company.description && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-sm text-gray-600 line-clamp-4">
                          {job.company.description}
                        </p>
                      </div>
                    )}

                    {/* Company Images */}
                    {job.company.images && job.company.images.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Hình ảnh công ty</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {job.company.images.slice(0, 4).map((img) => (
                            <img
                              key={img.companyImageId}
                              src={`${imageServiceBase}${img.filePath}`}
                              alt={img.caption || "Company image"}
                              className="w-full h-20 object-cover rounded-xl"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Employer Profile Card */}
              {job.employerProfile && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <FaUserTie className="text-gray-500" />
                      Nhà tuyển dụng
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {job.employerProfile.images && job.employerProfile.images.length > 0 ? (
                        <img
                          src={`${imageServiceBase}${job.employerProfile.images.find(img => img.isPrimary)?.filePath || job.employerProfile.images[0].filePath}`}
                          alt={job.employerProfile.displayName || "Recruiter"}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                          {job.employerProfile.displayName?.charAt(0) || "?"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-lg truncate">
                          {job.employerProfile.displayName || "Chưa cập nhật"}
                        </h4>
                        {job.employerProfile.position && (
                          <p className="text-sm text-gray-500">{job.employerProfile.position}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      {job.employerProfile.industry && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <FaBuilding className="text-gray-400 flex-shrink-0" />
                          <span>Lĩnh vực: {job.employerProfile.industry}</span>
                        </div>
                      )}
                      {job.employerProfile.yearsOfExperience !== undefined && job.employerProfile.yearsOfExperience > 0 && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <FaBriefcase className="text-gray-400 flex-shrink-0" />
                          <span>{job.employerProfile.yearsOfExperience} năm kinh nghiệm</span>
                        </div>
                      )}
                      {job.employerProfile.contactPhone && (
                        <a
                          href={`tel:${job.employerProfile.contactPhone}`}
                          className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <FaPhone className="text-gray-400 flex-shrink-0" />
                          <span>{job.employerProfile.contactPhone}</span>
                        </a>
                      )}
                      {job.employerProfile.website && (
                        <a
                          href={job.employerProfile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <FaGlobe className="text-gray-400 flex-shrink-0" />
                          <span className="truncate">{job.employerProfile.website}</span>
                        </a>
                      )}
                      {job.employerProfile.linkedInProfile && (
                        <a
                          href={job.employerProfile.linkedInProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <FaLinkedin className="text-blue-500 flex-shrink-0" />
                          <span>LinkedIn Profile</span>
                        </a>
                      )}
                    </div>

                    {/* Bio */}
                    {job.employerProfile.bio && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Giới thiệu</h5>
                        <p className="text-sm text-gray-600 line-clamp-4 whitespace-pre-line">
                          {job.employerProfile.bio}
                        </p>
                      </div>
                    )}

                    {/* Related Companies */}
                    {job.employerProfile.companies && job.employerProfile.companies.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h5 className="text-sm font-semibold text-gray-700 mb-3">Công ty liên quan</h5>
                        <div className="space-y-2">
                          {job.employerProfile.companies.slice(0, 3).map((company) => (
                            <div
                              key={company.companyId}
                              className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                              {company.logoURL ? (
                                <img
                                  src={company.logoURL}
                                  alt={company.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                  {company.name.charAt(0)}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">
                                  {company.name}
                                </p>
                                {company.role && (
                                  <p className="text-xs text-gray-500">{company.role}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Employer Images */}
                    {job.employerProfile.images && job.employerProfile.images.length > 1 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h5 className="text-sm font-semibold text-gray-700 mb-3">Hình ảnh</h5>
                        <div className="grid grid-cols-3 gap-2">
                          {job.employerProfile.images.slice(0, 3).map((img) => (
                            <img
                              key={img.imageId}
                              src={`${imageServiceBase}${img.filePath}`}
                              alt={img.caption || "Employer image"}
                              className="w-full aspect-square object-cover rounded-xl"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mobile Apply Button */}
              <div className="lg:hidden sticky bottom-4 z-20">
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className={`
                    w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-xl
                    ${applying
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white"
                    }
                  `}
                >
                  {applying ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FaBriefcase />
                      Ứng tuyển ngay
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {showGallery && jobImages.length > 0 && (
        <ImageGalleryModal
          images={jobImages}
          currentIndex={galleryIndex}
          onClose={() => setShowGallery(false)}
          onPrev={() => setGalleryIndex(prev => (prev === 0 ? jobImages.length - 1 : prev - 1))}
          onNext={() => setGalleryIndex(prev => (prev === jobImages.length - 1 ? 0 : prev + 1))}
        />
      )}
    </MainLayout>
  );
}
