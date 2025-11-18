import MainLayout from "../layout/MainLayout";
import { Link } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  FaSpinner,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaMapMarkerAlt,
  FaBriefcase,
  FaGraduationCap,
} from "react-icons/fa";
import { useApplicationNotifications } from "../contexts/ApplicationNotificationsContext";
import type { ApplicationItem } from "../types/applications";

export default function Applicants() {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);
  const { jobCounts, markJobAsRead, refreshSummary } =
    useApplicationNotifications();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasEmployerProfile, setHasEmployerProfile] = useState<boolean | null>(null);
  const [localJobCounts, setLocalJobCounts] = useState<typeof jobCounts>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const imageServiceBase =
    import.meta.env.VITE_IMAGES_SERVICE || "http://127.0.0.1:8000";
  const placeholderAvatar =
    "https://via.placeholder.com/96x96?text=CV";

  useEffect(() => {
    const fetchApplications = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        setHasEmployerProfile(false);
        return;
      }

      setLoading(true);
      try {
        const baseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5174/api/v1.0";

        // Kiểm tra employer profile bằng cách gọi endpoint summary trước
        const summaryResponse = await fetch(
          `${baseUrl}/applications/employer/summary`,
          { credentials: "include" }
        );

        if (summaryResponse.ok) {
          // User có employer profile
          console.log("✅ User has employer profile");
          const summaryData = (await summaryResponse.json()) as {
            totalUnread: number;
            jobCounts: typeof jobCounts;
            recentNotifications: any[];
          };
          
          setHasEmployerProfile(true);
          setLocalJobCounts(summaryData.jobCounts || []);
          console.log("✅ Job counts loaded:", summaryData.jobCounts?.length || 0);
          
          // Lấy danh sách applications
          const appsResponse = await fetch(
            `${baseUrl}/applications/employer`,
            { credentials: "include" }
          );
          
          if (appsResponse.ok) {
            const apps = (await appsResponse.json()) as ApplicationItem[];
            setApplications(apps);
            console.log("✅ Applications loaded:", apps.length);
          }
          
          // Gọi refreshSummary sau khi đã set state
          await refreshSummary();
        } else if (summaryResponse.status === 404) {
          // User không có employer profile
          console.log("❌ User does not have employer profile (404)");
          setHasEmployerProfile(false);
        } else {
          // Lỗi khác (401, 403, 500...)
          console.log("❌ Error checking employer profile:", summaryResponse.status);
          setHasEmployerProfile(false);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        setHasEmployerProfile(false);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedJobId && hasEmployerProfile) {
      markJobAsRead(selectedJobId);
    }
  }, [selectedJobId, hasEmployerProfile, markJobAsRead]);

  // Debug: Theo dõi thay đổi của hasEmployerProfile
  useEffect(() => {
    console.log("🔄 hasEmployerProfile changed to:", hasEmployerProfile);
  }, [hasEmployerProfile]);

  // Đồng bộ localJobCounts với jobCounts từ context khi context được cập nhật
  useEffect(() => {
    if (jobCounts.length > 0 && localJobCounts.length === 0) {
      console.log("🔄 Syncing localJobCounts from context:", jobCounts.length);
      setLocalJobCounts(jobCounts);
    }
  }, [jobCounts, localJobCounts.length]);

  const filteredApplications = selectedJobId
    ? applications.filter((app) => app.jobId === selectedJobId)
    : applications;
  
  // Ưu tiên dùng localJobCounts (từ API), nếu không có thì dùng jobCounts từ context
  const effectiveJobCounts = localJobCounts.length > 0 ? localJobCounts : jobCounts;
  const sortedJobCounts = useMemo(
    () => [...effectiveJobCounts].sort((a, b) => b.applicationCount - a.applicationCount),
    [effectiveJobCounts]
  );
  const statusMap: Record<
    string,
    { label: string; className: string }
  > = {
    APPLIED: { label: "Chờ xử lý", className: "bg-blue-100 text-blue-800" },
    REVIEWED: { label: "Đã xem", className: "bg-purple-100 text-purple-800" },
    ACCEPTED: { label: "Đã chấp nhận", className: "bg-green-100 text-green-800" },
    REJECTED: { label: "Đã từ chối", className: "bg-red-100 text-red-800" },
  };

  const getStatusMeta = (status: string) =>
    statusMap[status] ?? {
      label: status,
      className: "bg-gray-100 text-gray-800",
    };

  const buildAvatarUrl = (path?: string | null) =>
    path ? `${imageServiceBase}${path}` : placeholderAvatar;

  const parseSkills = (skills?: string | null) =>
    skills
      ? skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : [];

  // Debug log
  console.log("🔍 Render check - isAuthenticated:", isAuthenticated, "hasEmployerProfile:", hasEmployerProfile, "loading:", loading, "localJobCounts:", localJobCounts.length, "contextJobCounts:", jobCounts.length, "effectiveJobCounts:", sortedJobCounts.length);

  if (!isAuthenticated) {
    console.log("📍 Returning: Not authenticated");
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <FaUser className="mx-auto text-5xl text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Vui lòng đăng nhập
          </h1>
          <p className="text-gray-600">
            Bạn cần đăng nhập để xem danh sách ứng viên ứng tuyển công việc của
            mình.
          </p>
        </div>
      </MainLayout>
    );
  }

  if (hasEmployerProfile === false && !loading) {
    console.log("📍 Returning: 'Chỉ dành cho nhà tuyển dụng' message");
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <FaUser className="mx-auto text-5xl text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Chỉ dành cho nhà tuyển dụng
          </h1>
          <p className="text-gray-600">
            Tính năng này chỉ khả dụng khi bạn đăng nhập bằng tài khoản nhà
            tuyển dụng.
          </p>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    console.log("📍 Returning: Loading state");
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <FaSpinner className="animate-spin mx-auto text-4xl text-blue-600" />
            <p className="mt-4 text-gray-600">Đang tải danh sách ứng viên...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const hasJobPosts = sortedJobCounts.length > 0;

  if (!loading && hasEmployerProfile === true && !hasJobPosts) {
    console.log("📍 Returning: No job posts");
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <FaUser className="mx-auto text-5xl text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Bạn chưa có tin tuyển dụng nào
          </h1>
          <p className="text-gray-600 mb-6">
            Hãy đăng tin tuyển dụng đầu tiên để bắt đầu nhận hồ sơ ứng viên.
          </p>
          <Link
            to="/post-job"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đăng tin tuyển dụng
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Chỉ hiển thị danh sách khi có employer profile và đã tải xong
  if (hasEmployerProfile !== true) {
    console.log("📍 Returning: null (hasEmployerProfile !== true)");
    return null; // Sẽ được xử lý bởi các điều kiện trên
  }

  console.log("📍 Returning: Main content (applications list)");

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Ứng viên ứng tuyển
        </h1>

        {/* Job Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lọc theo công việc:
          </label>
          <select
            value={selectedJobId || ""}
            onChange={(e) => setSelectedJobId(e.target.value || null)}
            className="block w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tất cả công việc</option>
            {sortedJobCounts.map((job) => (
              <option key={job.jobId} value={job.jobId}>
                {job.jobTitle} ({job.applicationCount} ứng viên)
              </option>
            ))}
          </select>
        </div>

        {/* Job Counts Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {sortedJobCounts.map((job) => (
            <button
              key={job.jobId}
              onClick={() => setSelectedJobId(job.jobId)}
              className={`text-left bg-white rounded-lg shadow-md p-4 border transition-all ${
                selectedJobId === job.jobId
                  ? "border-blue-500 shadow-lg"
                  : "border-gray-200 hover:shadow-lg"
              }`}
            >
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {job.jobTitle}
              </h3>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-blue-600">
                  {job.applicationCount}
                </p>
                <span className="text-sm text-gray-500">Ứng viên</span>
              </div>
              {job.unreadCount > 0 && (
                <p className="mt-2 inline-flex items-center text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                  {job.unreadCount > 99 ? "99+ chưa đọc" : `${job.unreadCount} chưa đọc`}
                </p>
              )}
            </button>
          ))}
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Danh sách ứng viên ({filteredApplications.length})
            </h2>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FaUser className="mx-auto text-4xl mb-4 text-gray-400" />
              <p>Chưa có ứng viên nào ứng tuyển</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredApplications.map((app) => {
                const statusMeta = getStatusMeta(app.status);
                const skills = parseSkills(app.candidateProfile?.skills);
                const avatarUrl = buildAvatarUrl(
                  app.candidateProfile?.avatarPath
                );

                return (
                  <div
                    key={app.applicationId}
                    className={`p-6 transition-colors ${
                      app.isViewed ? "bg-white" : "bg-blue-50/70"
                    }`}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={avatarUrl}
                            alt={app.candidateName}
                            className="w-20 h-20 rounded-full object-cover border border-gray-200"
                            loading="lazy"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {app.candidateName}
                              </h3>
                              {!app.isViewed && (
                                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                  Mới
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {app.jobTitle}
                            </p>
                            {app.candidateProfile?.headline && (
                              <p className="text-sm text-gray-600 mt-1">
                                {app.candidateProfile.headline}
                              </p>
                            )}
                            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                              {app.candidateEmail && (
                                <a
                                  href={`mailto:${app.candidateEmail}`}
                                  className="flex items-center gap-2 hover:text-blue-600"
                                >
                                  <FaEnvelope className="text-gray-400" />
                                  {app.candidateEmail}
                                </a>
                              )}
                              {app.candidatePhone && (
                                <a
                                  href={`tel:${app.candidatePhone}`}
                                  className="flex items-center gap-2 hover:text-blue-600"
                                >
                                  <FaPhone className="text-gray-400" />
                                  {app.candidatePhone}
                                </a>
                              )}
                              {app.candidateProfile?.address && (
                                <span className="flex items-center gap-2">
                                  <FaMapMarkerAlt className="text-gray-400" />
                                  {app.candidateProfile.address}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                              {typeof app.candidateProfile?.experienceYears ===
                                "number" && (
                                <span className="flex items-center gap-2">
                                  <FaBriefcase className="text-gray-400" />
                                  {app.candidateProfile.experienceYears} năm kinh nghiệm
                                </span>
                              )}
                              {app.candidateProfile?.educationLevel && (
                                <span className="flex items-center gap-2">
                                  <FaGraduationCap className="text-gray-400" />
                                  {app.candidateProfile.educationLevel}
                                </span>
                              )}
                              <span className="flex items-center gap-2">
                                <FaCalendar className="text-gray-400" />
                                Ứng tuyển:{" "}
                                {new Date(app.appliedAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusMeta.className}`}
                          >
                            {statusMeta.label}
                          </span>
                          {app.updatedAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              Cập nhật:{" "}
                              {new Date(app.updatedAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      {skills.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Kỹ năng
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                              <span
                                key={`${app.applicationId}-${skill}`}
                                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {app.candidateProfile?.bio && (
                        <p className="text-sm text-gray-700">
                          {app.candidateProfile.bio}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-blue-600">
                        {app.candidateProfile?.linkedInProfile && (
                          <a
                            href={app.candidateProfile.linkedInProfile}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                          >
                            LinkedIn
                          </a>
                        )}
                        {app.candidateProfile?.portfolioUrl && (
                          <a
                            href={app.candidateProfile.portfolioUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                          >
                            Portfolio
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
