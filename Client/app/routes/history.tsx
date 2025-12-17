import MainLayout from "../layout/MainLayout";
import { Link } from "react-router";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSignalR } from "../contexts/SignalRContext";
import {
  FaSpinner,
  FaUser,
  FaBriefcase,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaEye,
  FaBuilding,
  FaFilter,
  FaHistory,
  FaChevronRight,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaUserTie,
  FaExternalLinkAlt,
} from "react-icons/fa";
import type {
  CandidateApplicationItem,
  StatusNotification,
} from "../types/applications";
import {
  STATUS_LABELS,
  STATUS_COLORS,
} from "../types/applications";
import axios from "axios";

export function meta() {
  return [
    { title: "JobsViet - Lịch sử ứng tuyển" },
    {
      name: "description",
      content: "Xem lịch sử ứng tuyển của bạn trên JobsViet!",
    },
  ];
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.APPLIED;
  const label = STATUS_LABELS[status] || status;

  const getIcon = () => {
    switch (status) {
      case 'ACCEPTED':
        return <FaCheckCircle className="text-xs" />;
      case 'REJECTED':
        return <FaTimesCircle className="text-xs" />;
      case 'INTERVIEWING':
        return <FaUserTie className="text-xs" />;
      case 'REVIEWED':
        return <FaEye className="text-xs" />;
      default:
        return <FaClock className="text-xs" />;
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
      {getIcon()}
      {label}
    </span>
  );
};

const formatSalary = (from?: number | null, to?: number | null): string => {
  const fromNum = from !== undefined && from !== null ? Number(from) : null;
  const toNum = to !== undefined && to !== null ? Number(to) : null;

  if (fromNum === null && toNum === null) return "Thỏa thuận";
  if (fromNum === 0 && toNum === 0) return "Thỏa thuận";

  // Helper to format a salary value based on its magnitude
  const formatValue = (val: number): string => {
    if (val >= 1000000) {
      return (val / 1000000).toFixed(0);
    } else if (val >= 1000) {
      return (val / 1000).toFixed(0);
    } else {
      return val.toFixed(0);
    }
  };

  if (fromNum !== null && toNum !== null && fromNum > 0 && toNum > 0) {
    return `${formatValue(fromNum)} - ${formatValue(toNum)} triệu`;
  }
  if (fromNum !== null && fromNum > 0)
    return `Từ ${formatValue(fromNum)} triệu`;
  if (toNum !== null && toNum > 0)
    return `Đến ${formatValue(toNum)} triệu`;
  return "Thỏa thuận";
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const StatusTimeline: React.FC<{ currentStatus: string; updatedAt?: string | null }> = ({ currentStatus, updatedAt }) => {
  const steps = [
    { key: 'APPLIED', label: 'Đã ứng tuyển' },
    { key: 'REVIEWED', label: 'Đã xem' },
    { key: 'INTERVIEWING', label: 'Phỏng vấn' },
    { key: 'ACCEPTED', label: 'Nhận việc' },
  ];

  // Logic to determine active step index
  let activeIndex = 0;
  if (currentStatus === 'REJECTED') {
    // Special case for rejected ??? Maybe just show red state at current step?
    // For simplicity, REJECTED could be a separate state display or just stop at last known valid state.
    // Let's treat REJECTED as a terminal bad state.
  }

  const statusOrder = ['APPLIED', 'REVIEWED', 'INTERVIEWING', 'ACCEPTED'];
  activeIndex = statusOrder.indexOf(currentStatus);
  if (activeIndex === -1 && currentStatus === 'REJECTED') activeIndex = -1; // Special handling

  if (currentStatus === 'REJECTED') {
    return (
      <div className="w-full bg-red-50 rounded-xl p-4 border border-red-100 mt-4">
        <div className="flex items-center gap-3 text-red-700">
          <FaTimesCircle className="text-xl" />
          <div>
            <h4 className="font-bold">Hồ sơ đã bị từ chối</h4>
            <p className="text-sm opacity-80">Rất tiếc, hồ sơ của bạn chưa phù hợp với vị trí này.</p>
            {updatedAt && <p className="text-xs mt-1 opacity-70">Cập nhật: {formatDate(updatedAt)}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <div className="relative flex justify-between">
        {/* Connector Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500"
          style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index <= activeIndex;
          const isCurrent = index === activeIndex;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted
                  ? "bg-green-500 border-green-500 text-white"
                  : "bg-white border-gray-200 text-gray-300"
                  }`}
              >
                {isCompleted ? <FaCheckCircle className="text-sm" /> : <div className="w-2 h-2 rounded-full bg-current" />}
              </div>
              <span className={`text-xs font-semibold whitespace-nowrap ${isCompleted ? "text-gray-900" : "text-gray-400"
                }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      {updatedAt && (
        <div className="text-right mt-2 text-xs text-gray-400">
          Cập nhật mới nhất: {formatDate(updatedAt)}
        </div>
      )}
    </div>
  );
};

export default function History() {
  const { user } = useAuth();
  const { subscribe } = useSignalR();
  const isAuthenticated = Boolean(user);

  const [applications, setApplications] = useState<CandidateApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const imageServiceBase = import.meta.env.VITE_IMAGES_SERVICE || "http://127.0.0.1:8000";
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5174/api/v1.0";

  const fetchApplicationHistory = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<CandidateApplicationItem[]>(`${baseUrl}/applications/candidate`, {
        withCredentials: true,
      });

      setApplications(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("Bạn cần đăng nhập để xem lịch sử ứng tuyển");
      } else {
        setError("Lỗi kết nối đến server");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, baseUrl]);

  useEffect(() => {
    fetchApplicationHistory();
  }, [fetchApplicationHistory]);

  // Subscribe to status update notifications via SignalR
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = subscribe("receivestatusupdate", (notification: StatusNotification) => {
      setApplications(prev =>
        prev.map(app =>
          app.applicationId === notification.applicationId
            ? { ...app, status: notification.newStatus, updatedAt: notification.updatedAt }
            : app
        )
      );
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, subscribe]);

  const filteredApplications = filterStatus === "ALL"
    ? applications
    : applications.filter(app => app.status === filterStatus);

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden text-center">
            <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <div className="p-8">
              <div className="w-20 h-20 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-4xl mb-6">
                <FaUser />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Vui lòng đăng nhập
              </h2>
              <p className="text-gray-600 mb-6">
                Bạn cần đăng nhập để xem lịch sử ứng tuyển của mình.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Loading
  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
              <FaSpinner className="text-blue-600 text-2xl animate-spin" />
            </div>
            <p className="text-gray-600 font-medium">Đang tải lịch sử ứng tuyển...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error
  if (error) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden text-center">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 h-2" />
            <div className="p-8">
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-2xl flex items-center justify-center text-red-600 text-4xl mb-6">
                <FaTimesCircle />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Đã xảy ra lỗi
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchApplicationHistory}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50/50 pb-12">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 py-12 mb-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-3xl shadow-xl border border-white/20">
                <FaHistory />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Lịch sử ứng tuyển</h1>
                <p className="text-white/90 text-lg">Theo dõi trạng thái các hồ sơ bạn đã gửi</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setFilterStatus("ALL")}
                className={`group px-6 py-3 rounded-2xl transition-all duration-300 flex items-center gap-3 ${filterStatus === "ALL"
                  ? "bg-white text-blue-600 shadow-lg translate-y-[-2px]"
                  : "bg-white/10 text-white hover:bg-white/20"
                  }`}
              >
                <span className={`text-2xl font-bold ${filterStatus === "ALL" ? "text-blue-600" : "text-white"}`}>
                  {applications.length}
                </span>
                <span className="text-sm font-medium">Tất cả hồ sơ</span>
              </button>

              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key)}
                  className={`group px-6 py-3 rounded-2xl transition-all duration-300 flex items-center gap-3 ${filterStatus === key
                    ? "bg-white shadow-lg translate-y-[-2px]"
                    : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                >
                  <span className={`text-2xl font-bold ${filterStatus === key ? STATUS_COLORS[key].text.replace("text-", "text-") : "text-white"
                    } ${filterStatus === key ? "" : ""}`}>
                    {statusCounts[key] || 0}
                  </span>
                  <span className={`text-sm font-medium ${filterStatus === key ? "text-gray-900" : "text-white/90"}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Filter Bar - Removed redundant filter bar as we have tabs above */}

          {/* Empty State */}
          {filteredApplications.length === 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
              <div className="w-24 h-24 mx-auto bg-blue-50 rounded-full flex items-center justify-center text-blue-400 text-5xl mb-6">
                <FaBriefcase />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {filterStatus === "ALL"
                  ? "Bạn chưa ứng tuyển công việc nào"
                  : `Không có hồ sơ nào ở trạng thái "${STATUS_LABELS[filterStatus]}"`}
              </h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {filterStatus === "ALL"
                  ? "Hãy bắt đầu tìm kiếm và ứng tuyển những cơ hội nghề nghiệp tốt nhất phù hợp với bạn!"
                  : "Thử lọc theo trạng thái khác để xem các hồ sơ của bạn."}
              </p>
              {filterStatus === "ALL" && (
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <FaBriefcase />
                  Tìm việc ngay
                </Link>
              )}
            </div>
          )}

          {/* Applications List */}
          <div className="space-y-6">
            {filteredApplications.map((app) => (
              <div
                key={app.applicationId}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Brand / Logo */}
                  <div className="flex-shrink-0">
                    {app.companyLogoUrl ? (
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 bg-white p-1">
                        <img
                          src={app.companyLogoUrl}
                          alt={app.companyName || "Company"}
                          className="w-full h-full object-contain rounded-xl"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 text-3xl">
                        <FaBuilding />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                          <Link to={`/job/${app.jobGuid}`} className="flex items-center gap-2">
                            {app.jobTitle}
                            <FaExternalLinkAlt className="text-sm opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                          </Link>
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                          {app.companyName}
                          {app.industry && <span className="text-gray-400 font-normal text-sm">• {app.industry}</span>}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <StatusBadge status={app.status} />
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-6 text-sm mb-6">
                      <div className="flex items-center gap-2.5 text-gray-600">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                          <FaMoneyBillWave />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 font-medium uppercase">Mức lương</span>
                          <span className="font-semibold text-gray-900">{formatSalary(app.salaryFrom, app.salaryTo)}</span>
                        </div>
                      </div>

                      {app.location && (
                        <div className="flex items-center gap-2.5 text-gray-600">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                            <FaMapMarkerAlt />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-400 font-medium uppercase">Địa điểm</span>
                            <span className="font-medium text-gray-900 truncate max-w-[150px]">{app.location}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2.5 text-gray-600">
                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                          <FaCalendarAlt />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 font-medium uppercase">Ngày ứng tuyển</span>
                          <span className="font-medium text-gray-900">{formatDate(app.appliedAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 text-gray-600">
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                          <FaBriefcase />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 font-medium uppercase">Hình thức</span>
                          <span className="font-medium text-gray-900">{app.employmentType || "Toàn thời gian"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <StatusTimeline currentStatus={app.status} updatedAt={app.updatedAt} />

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
