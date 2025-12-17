import MainLayout from "../layout/MainLayout";
import { Link } from "react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
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
  FaCheckCircle,
  FaTimesCircle,
  FaUserTie,
  FaUsers,
} from "react-icons/fa";
import { useApplicationNotifications } from "../contexts/ApplicationNotificationsContext";
import type { ApplicationItem, ApplicationStatusUpdateResult } from "../types/applications";
import axios from "axios";

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
        const summaryResponse = await axios.get<{
          totalUnread: number;
          jobCounts: typeof jobCounts;
          recentNotifications: any[];
        }>(`${baseUrl}/applications/employer/summary`, { withCredentials: true });

        // User có employer profile (Axios throws on non-2xx by default, so specific 404 check needs try-catch block if 404 is expected flow, 
        // OR validateStatus config. But here try-catch is used.)
        const summaryData = summaryResponse.data;

        setHasEmployerProfile(true);
        setLocalJobCounts(summaryData.jobCounts || []);

        // Lấy danh sách applications
        const appsResponse = await axios.get<ApplicationItem[]>(
          `${baseUrl}/applications/employer`,
          { withCredentials: true }
        );

        setApplications(appsResponse.data);

        // Gọi refreshSummary sau khi đã set state
        await refreshSummary();

      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setHasEmployerProfile(false);
        } else {
          setHasEmployerProfile(false);
        }
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

  useEffect(() => {
    if (jobCounts.length > 0 && localJobCounts.length === 0) {
      setLocalJobCounts(jobCounts);
    }
  }, [jobCounts, localJobCounts.length]);

  const filteredApplications = selectedJobId
    ? applications.filter((app) => app.jobId === selectedJobId)
    : applications;

  const effectiveJobCounts = localJobCounts.length > 0 ? localJobCounts : jobCounts;
  const sortedJobCounts = useMemo(
    () => [...effectiveJobCounts].sort((a, b) => b.applicationCount - a.applicationCount),
    [effectiveJobCounts]
  );
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5174/api/v1.0";
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const statusMap: Record<
    string,
    { label: string; className: string }
  > = {
    APPLIED: { label: "Chờ xử lý", className: "bg-blue-100 text-blue-800" },
    REVIEWED: { label: "Đã xem", className: "bg-purple-100 text-purple-800" },
    INTERVIEWING: { label: "Đang phỏng vấn", className: "bg-amber-100 text-amber-800" },
    ACCEPTED: { label: "Đã chấp nhận", className: "bg-green-100 text-green-800" },
    REJECTED: { label: "Đã từ chối", className: "bg-red-100 text-red-800" },
  };

  const updateApplicationStatus = useCallback(async (applicationId: string, newStatus: string) => {
    setUpdatingStatus(applicationId);
    try {
      const response = await axios.put<ApplicationStatusUpdateResult>(
        `${baseUrl}/applications/${applicationId}/status`,
        { status: newStatus },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = response.data;
      if (result.success) {
        // Update local state
        setApplications(prev =>
          prev.map(app =>
            app.applicationId === applicationId
              ? { ...app, status: result.newStatus || newStatus, updatedAt: result.updatedAt, isViewed: true }
              : app
          )
        );
        await refreshSummary();
      }
    } catch (error) {
    } finally {
      setUpdatingStatus(null);
    }
  }, [baseUrl, refreshSummary]);

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

  if (!isAuthenticated) {
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
    return null; // Sẽ được xử lý bởi các điều kiện trên
  }


  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50/50 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quản lý ứng viên
              </h1>
              <p className="text-gray-500">Xem và quản lý các hồ sơ đã ứng tuyển cho công việc của bạn</p>
            </div>
            {/* Job Filter - Moved to header area */}
            <div className="w-full md:w-72">
              <select
                value={selectedJobId || ""}
                onChange={(e) => setSelectedJobId(e.target.value || null)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">Tất cả công việc</option>
                {sortedJobCounts.map((job) => (
                  <option key={job.jobId} value={job.jobId}>
                    {job.jobTitle} ({job.applicationCount})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Job Counts Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {sortedJobCounts.map((job) => (
              <button
                key={job.jobId}
                onClick={() => setSelectedJobId(job.jobId)}
                className={`group relative text-left p-5 rounded-2xl transition-all duration-300 ${selectedJobId === job.jobId
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200"
                  : "bg-white border border-gray-100 text-gray-900 hover:shadow-md hover:border-blue-200"
                  }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className={`font-bold text-lg truncate ${selectedJobId === job.jobId ? "text-white" : "text-gray-900"}`}>
                      {job.jobTitle}
                    </h3>
                  </div>
                  <span className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-lg ${selectedJobId === job.jobId ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600"
                    }`}>
                    {job.applicationCount}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className={`text-sm ${selectedJobId === job.jobId ? "text-blue-100" : "text-gray-500"}`}>
                    Tổng số ứng viên
                  </span>
                  {job.unreadCount > 0 && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-bold shadow-sm animate-pulse">
                      {job.unreadCount > 99 ? "99+" : job.unreadCount} mới
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Applications List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Danh sách ứng viên <span className="text-gray-400 font-normal ml-2">({filteredApplications.length})</span>
              </h2>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center text-gray-400 text-4xl mb-4">
                  <FaUsers />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có ứng viên nào</h3>
                <p className="text-gray-500">
                  {selectedJobId ? "Công việc này chưa nhận được hồ sơ nào." : "Hiện chưa có ứng viên nào ứng tuyển vào các công việc của bạn."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredApplications.map((app) => {
                  const statusMeta = getStatusMeta(app.status);
                  const skills = parseSkills(app.candidateProfile?.skills);
                  const avatarUrl = buildAvatarUrl(
                    app.candidateProfile?.avatarPath
                  );

                  return (
                    <div
                      key={app.applicationId}
                      className={`bg-white rounded-2xl p-6 border transition-all duration-300 ${!app.isViewed ? "border-blue-200 shadow-md bg-blue-50/30" : "border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100"
                        }`}
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <img
                              src={avatarUrl}
                              alt={app.candidateName}
                              className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-sm"
                              loading="lazy"
                            />
                            {!app.isViewed && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                                <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Header: Name, Status, Date */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                                {app.candidateName}
                                {!app.isViewed && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-md font-bold uppercase tracking-wide">Mới</span>}
                              </h3>
                              <p className="text-blue-600 font-medium text-sm flex items-center gap-1.5">
                                <FaBriefcase className="text-xs" />
                                {app.jobTitle}
                              </p>
                              {app.candidateProfile?.headline && (
                                <p className="text-gray-500 text-sm mt-1 line-clamp-1 italic">"{app.candidateProfile.headline}"</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusMeta.className}`}>
                                {statusMeta.label}
                              </span>
                              <div className="text-xs text-gray-400 text-right">
                                <div className="flex items-center gap-1 justify-end">
                                  <FaCalendar className="text-xxs" />
                                  {new Date(app.appliedAt).toLocaleDateString("vi-VN")}
                                </div>
                                {app.updatedAt && app.status !== 'APPLIED' && (
                                  <div className="mt-0.5">Cập nhật: {new Date(app.updatedAt).toLocaleDateString("vi-VN")}</div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 text-sm text-gray-600 mb-5">
                            {app.candidateEmail && (
                              <a href={`mailto:${app.candidateEmail}`} className="flex items-center gap-2 hover:text-blue-600 transition-colors group">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                  <FaEnvelope />
                                </div>
                                <span className="truncate">{app.candidateEmail}</span>
                              </a>
                            )}
                            {app.candidatePhone && (
                              <a href={`tel:${app.candidatePhone}`} className="flex items-center gap-2 hover:text-blue-600 transition-colors group">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                  <FaPhone />
                                </div>
                                <span>{app.candidatePhone}</span>
                              </a>
                            )}
                            {typeof app.candidateProfile?.experienceYears === "number" && (
                              <div className="flex items-center gap-2 group">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                                  <FaBriefcase />
                                </div>
                                <span>{app.candidateProfile.experienceYears} năm kinh nghiệm</span>
                              </div>
                            )}
                          </div>

                          {/* Skills & Bio */}
                          <div className="mb-5 bg-gray-50 rounded-xl p-4 border border-gray-100/50">
                            {skills.length > 0 ? (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {skills.map((skill) => (
                                  <span key={`${app.applicationId}-${skill}`} className="bg-white border border-gray-200 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-lg shadow-sm">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-400 text-sm italic mb-3">Ứng viên chưa cập nhật kỹ năng.</p>
                            )}

                            {app.candidateProfile?.bio && (
                              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 hover:line-clamp-none transition-all mb-3">
                                {app.candidateProfile.bio}
                              </p>
                            )}

                            {/* Portfolio Images */}
                            {app.candidateProfile?.portfolioImagePaths && app.candidateProfile.portfolioImagePaths.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200/50">
                                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Ảnh Portfolio</p>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                  {app.candidateProfile.portfolioImagePaths.map((path, idx) => (
                                    <div
                                      key={idx}
                                      className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-200 cursor-zoom-in hover:ring-2 hover:ring-blue-400 transition-all"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const overlay = document.createElement('div');
                                        overlay.className = 'fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center cursor-zoom-out p-4';
                                        overlay.onclick = () => overlay.remove();
                                        const img = document.createElement('img');
                                        img.src = `${imageServiceBase}${path}`;
                                        img.className = 'max-w-full max-h-full object-contain rounded-lg shadow-2xl';
                                        img.onclick = (ev) => ev.stopPropagation();
                                        overlay.appendChild(img);
                                        document.body.appendChild(overlay);
                                      }}
                                    >
                                      <img
                                        src={`${imageServiceBase}${path}`}
                                        alt={`Portfolio ${idx}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Actions Footer */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                            {/* Links */}
                            <div className="flex items-center gap-4 text-sm font-medium">
                              {app.candidateProfile?.linkedInProfile && (
                                <a href={app.candidateProfile.linkedInProfile} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                                  LinkedIn Profile
                                </a>
                              )}
                              {app.candidateProfile?.portfolioUrl && (
                                <a href={app.candidateProfile.portfolioUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                                  Portfolio URL
                                </a>
                              )}
                            </div>

                            {/* Action Buttons */}
                            {app.status !== "ACCEPTED" && app.status !== "REJECTED" && (
                              <div className="flex items-center gap-2">
                                {app.status !== "INTERVIEWING" && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); updateApplicationStatus(app.applicationId, "INTERVIEWING"); }}
                                    disabled={updatingStatus === app.applicationId}
                                    className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl font-medium text-sm hover:bg-amber-100 transition-colors disabled:opacity-50"
                                  >
                                    <FaUserTie /> Phỏng vấn
                                  </button>
                                )}
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateApplicationStatus(app.applicationId, "ACCEPTED"); }}
                                  disabled={updatingStatus === app.applicationId}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                                >
                                  <FaCheckCircle /> Chấp nhận
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateApplicationStatus(app.applicationId, "REJECTED"); }}
                                  disabled={updatingStatus === app.applicationId}
                                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all disabled:opacity-50"
                                >
                                  <FaTimesCircle /> Từ chối
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

