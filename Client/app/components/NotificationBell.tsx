import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  FaBell,
  FaCheckCircle,
  FaEnvelope,
  FaSuitcase,
  FaUser,
  FaBuilding,
  FaArrowRight,
} from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useAuth } from "../contexts/AuthContext";
import { useApplicationNotifications } from "../contexts/ApplicationNotificationsContext";
import { useSignalR } from "../contexts/SignalRContext";
import type { ApplicationNotification, StatusNotification, CandidateApplicationItem, PersistedNotification } from "../types/applications";
import { STATUS_LABELS, STATUS_COLORS } from "../types/applications";
import { Link } from "react-router";
import { api } from "../services/api";

const NotificationBell: React.FC = () => {
  const {
    notifications: employerNotifications,
    totalUnread: employerUnread,
    markNotificationAsRead,
    refreshSummary,
    markAllAsRead,
  } = useApplicationNotifications();
  const { user } = useAuth();
  const { subscribe } = useSignalR();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Profile detection
  const [hasEmployerProfile, setHasEmployerProfile] = useState(false);
  const [hasCandidateProfile, setHasCandidateProfile] = useState(false);

  // Candidate-specific state - fetch recent status changes
  const [candidateNotifications, setCandidateNotifications] = useState<StatusNotification[]>([]);
  const [candidateUnread, setCandidateUnread] = useState(0);

  // Persisted notifications from database
  const [persistedNotifications, setPersistedNotifications] = useState<PersistedNotification[]>([]);
  const [persistedUnread, setPersistedUnread] = useState(0);

  // Tab state for dual-role users
  const [activeTab, setActiveTab] = useState<"employer" | "candidate">("employer");

  // Fetch persisted notifications from database
  const fetchPersistedNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const response = await api.get<PersistedNotification[]>(
        "/v1.0/notifications"
      );
      setPersistedNotifications(response.data || []);
      setPersistedUnread((response.data || []).filter(n => !n.isRead).length);
    } catch (error) {
    }
  }, [user]);

  // Check for profiles on mount
  useEffect(() => {
    if (!user) return;

    const checkProfiles = async () => {
      try {
        // Check employer profile
        await api.get("/v1.0/applications/employer/summary");
        setHasEmployerProfile(true);
      } catch {
        setHasEmployerProfile(false);
      }

      try {
        // Check candidate profile by fetching applications
        const response = await api.get<CandidateApplicationItem[]>("/v1.0/applications/candidate");
        setHasCandidateProfile(true);

        // Get recent status updates (last 24h or last 10)
        const recentApps = (response.data || [])
          .filter(app => app.status !== "APPLIED" && app.updatedAt)
          .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
          .slice(0, 10);

        // Convert to StatusNotification format
        const notifications: StatusNotification[] = recentApps.map(app => ({
          applicationId: app.applicationId,
          jobId: app.jobId,
          jobTitle: app.jobTitle,
          companyName: app.companyName,
          oldStatus: "APPLIED", // We don't track old status, so assume APPLIED
          newStatus: app.status,
          updatedAt: app.updatedAt || app.appliedAt,
        }));

        setCandidateNotifications(notifications);
        // Consider unread as those updated in last 24 hours
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        setCandidateUnread((notifications || []).filter(n => new Date(n.updatedAt).getTime() > oneDayAgo).length);
      } catch {
        setHasCandidateProfile(false);
      }

      // Fetch persisted notifications from database
      await fetchPersistedNotifications();
    };

    checkProfiles();
  }, [user, fetchPersistedNotifications]);

  // Subscribe to candidate status updates via SignalR
  useEffect(() => {
    if (!hasCandidateProfile) return;

    const unsubscribe = subscribe("receivestatusupdate", (notification: StatusNotification) => {
      // We rely on persisted notifications for the list, so we just refresh them
      fetchPersistedNotifications();
    });

    return () => {
      unsubscribe();
    };
  }, [hasCandidateProfile, subscribe, fetchPersistedNotifications]);


  // Set default tab based on available profiles
  useEffect(() => {
    if (hasEmployerProfile) {
      setActiveTab("employer");
    } else if (hasCandidateProfile) {
      setActiveTab("candidate");
    }
  }, [hasEmployerProfile, hasCandidateProfile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (hasEmployerProfile) {
      refreshSummary();
    }
  }, [hasEmployerProfile, refreshSummary]);

  const handleEmployerNotificationClick = (notification: ApplicationNotification) => {
    if (!notification.isViewed && notification.jobId) {
      markNotificationAsRead(notification.jobId);
    }
  };

  const handleCandidateNotificationClick = () => {
    // No-op locally, rely on clicking individual notifications to mark as read
  };

  const handleMarkAllEmployerRead = () => {
    if (markAllAsRead) markAllAsRead();
  };

  const handlePersistedNotificationClick = async (notificationId: string) => {
    try {
      await api.post(`/v1.0/notifications/${notificationId}/read`, {});
      setPersistedNotifications(prev =>
        prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n)
      );
      setPersistedUnread(prev => Math.max(0, prev - 1));
    } catch (error) {
    }
  };

  // Filter persisted notifications for candidate tab (Status Updates)
  const candidateStatusNotifications = (persistedNotifications || []).filter(
    n => n.type === "ApplicationStatus"
  );
  const candidateStatusUnread = (candidateStatusNotifications || []).filter(n => !n.isRead).length;

  const totalUnread = persistedUnread + (hasEmployerProfile ? employerUnread : 0);

  const getBadgeContent = () => {
    const count = (hasEmployerProfile ? employerUnread : 0) + persistedUnread;
    if (count > 99) return "99+";
    if (count <= 0) return null;
    return count;
  };

  // Don't show if not logged in or no profiles
  if (!user || (!hasEmployerProfile && !hasCandidateProfile)) return null;

  const showTabs = hasEmployerProfile && hasCandidateProfile;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative text-gray-600 hover:text-gray-800"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <FaBell className="h-6 w-6" />
        {getBadgeContent() !== null && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full px-1.5 min-w-[18px] text-center">
            {getBadgeContent()}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header with tabs for dual-role users */}
          <div className="border-b border-gray-100">
            {showTabs ? (
              <div className="flex">
                <button
                  onClick={() => setActiveTab("employer")}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "employer"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Ứng viên mới
                  {employerUnread > 0 && (
                    <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5">
                      {employerUnread > 99 ? "99+" : employerUnread}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => { setActiveTab("candidate"); }}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "candidate"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Trạng thái hồ sơ
                  {candidateStatusUnread > 0 && (
                    <span className="ml-1.5 bg-green-500 text-white text-xs rounded-full px-1.5">
                      {candidateStatusUnread > 99 ? "99+" : candidateStatusUnread}
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  {hasEmployerProfile ? "Ứng viên mới" : "Cập nhật trạng thái"}
                  {hasEmployerProfile && employerUnread > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {employerUnread > 99 ? "99+" : employerUnread}
                    </span>
                  )}
                  {!hasEmployerProfile && hasCandidateProfile && candidateStatusUnread > 0 && (
                    <span className="bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {candidateStatusUnread > 99 ? "99+" : candidateStatusUnread}
                    </span>
                  )}
                </h3>
                {hasEmployerProfile && (
                  <button
                    className="text-xs text-blue-600 hover:underline"
                    onClick={handleMarkAllEmployerRead}
                  >
                    Đánh dấu tất cả đã đọc
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Content based on active tab */}
          {activeTab === "employer" && hasEmployerProfile && (
            <>
              <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-xs text-gray-500">Mới nhất</span>
                <button onClick={handleMarkAllEmployerRead} className="text-xs text-blue-600 hover:underline">
                  Đánh dấu tất cả đã đọc
                </button>
              </div>
              {employerNotifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  Hiện chưa có ứng viên mới
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {employerNotifications.map((notification) => (
                    <button
                      key={notification.applicationId}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-gray-100 hover:bg-gray-50 ${notification.isViewed ? "bg-white" : "bg-blue-50"
                        }`}
                      onClick={() => handleEmployerNotificationClick(notification)}
                    >
                      <div
                        className={`mt-1 h-8 w-8 flex items-center justify-center rounded-full ${notification.isViewed
                          ? "bg-gray-200 text-gray-500"
                          : "bg-blue-500 text-white"
                          }`}
                      >
                        {notification.isViewed ? <FaCheckCircle /> : <FaSuitcase />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {notification.candidateName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          Ứng tuyển: {notification.jobTitle}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notification.appliedAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-center">
                <Link to="/employer/dashboard" onClick={() => setIsOpen(false)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  Xem tất cả ứng viên
                </Link>
              </div>
            </>
          )}

          {activeTab === "candidate" && hasCandidateProfile && (
            <>
              {candidateStatusNotifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  Chưa có cập nhật trạng thái mới
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {candidateStatusNotifications.map((notification) => (
                    <button
                      key={notification.notificationId}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-gray-100 hover:bg-gray-50 ${notification.isRead ? "bg-white" : "bg-blue-50"
                        }`}
                      onClick={() => handlePersistedNotificationClick(notification.notificationId)}
                    >
                      <div
                        className={`mt-1 h-8 w-8 flex items-center justify-center rounded-full ${notification.isRead ? "bg-gray-200 text-gray-500" : "bg-green-500 text-white"
                          }`}
                      >
                        <FaCheckCircle />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-center">
                <Link to="/candidate/applications" onClick={() => setIsOpen(false)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  Xem tất cả hồ sơ
                </Link>
              </div>
            </>
          )}

          {/* Footer link */}
          <div className="px-4 py-3 text-center border-t border-gray-100">
            <Link
              to={activeTab === "employer" ? "/applicants" : "/history"}
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setIsOpen(false)}
            >
              {activeTab === "employer" ? "Xem tất cả ứng viên" : "Xem lịch sử ứng tuyển"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
