import React, { useEffect, useRef, useState } from "react";
import {
  FaBell,
  FaCheckCircle,
  FaEnvelope,
  FaSuitcase,
  FaUser,
} from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useAuth } from "../contexts/AuthContext";
import { useApplicationNotifications } from "../contexts/ApplicationNotificationsContext";
import type { ApplicationNotification } from "../types/applications";

const NotificationBell: React.FC = () => {
  const {
    notifications,
    totalUnread,
    markNotificationAsRead,
    refreshSummary,
  } = useApplicationNotifications();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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
    if (!user) return;
    refreshSummary();
  }, [user, refreshSummary]);

  const handleNotificationClick = (notification: ApplicationNotification) => {
    if (!notification.isViewed && notification.jobId) {
      markNotificationAsRead(notification.jobId);
    }
  };

  const getBadgeContent = () => {
    if (totalUnread > 99) return "99+";
    if (totalUnread <= 0) return null;
    return totalUnread;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative text-gray-600 hover:text-gray-800"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <FaBell className="h-6 w-6" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full px-1.5">
            {getBadgeContent()}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">
              Thông báo ứng viên
            </h3>
            <button
              className="text-xs text-blue-600 hover:underline"
              onClick={refreshSummary}
            >
              Làm mới
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              Hiện chưa có thông báo nào
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <button
                  key={notification.applicationId}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-gray-100 hover:bg-gray-50 ${
                    notification.isViewed ? "bg-white" : "bg-blue-50"
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div
                    className={`mt-1 h-8 w-8 flex items-center justify-center rounded-full ${
                      notification.isViewed
                        ? "bg-gray-200 text-gray-500"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    {notification.isViewed ? (
                      <FaCheckCircle />
                    ) : (
                      <FaSuitcase />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">
                      {notification.candidateName}
                      <span className="text-gray-500 font-normal">
                        {" đã ứng tuyển "}
                        {notification.jobTitle}
                      </span>
                    </p>
                    <div className="mt-1 text-xs text-gray-500 flex flex-col gap-1">
                      <span className="flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        {notification.candidateHeadline || "Chưa có tiêu đề"}
                      </span>
                      <span className="flex items-center gap-2">
                        <FaEnvelope className="text-gray-400" />
                        {notification.candidateEmail || "Không có email"}
                      </span>
                    </div>
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

          <div className="px-4 py-3 text-center">
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={() => {
                refreshSummary();
                setIsOpen(false);
              }}
            >
              Xem tất cả tại trang ứng viên
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
