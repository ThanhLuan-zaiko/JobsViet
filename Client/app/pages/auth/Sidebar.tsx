import React from "react";
import { Link, useLocation } from "react-router";
import {
  FaHome,
  FaFire,
  FaHistory,
  FaRegLightbulb,
  FaHeart,
  FaPlusSquare,
  FaClipboardList,
  FaUserFriends,
  FaUser,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { useApplicationNotifications } from "../../contexts/ApplicationNotificationsContext";
import ConfirmationModal from "../../components/Common/ConfirmationModal";
import { useState } from "react";


const Sidebar: React.FC = () => {
  const location = useLocation();
  const { totalUnread } = useApplicationNotifications();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    // Implement actual logout logic here if available, or just redirect
    window.location.href = "/login"; // Placeholder redirect
  };


  const userMenus = [
    { to: "/", icon: <FaHome />, label: "Trang chủ" },
    // { to: "/trending", icon: <FaFire />, label: "Thịnh hành" },
    { to: "/history", icon: <FaHistory />, label: "Lịch sử ứng tuyển" },
    { to: "/suggested", icon: <FaRegLightbulb />, label: "Việc gợi ý" },
    // { to: "/following", icon: <FaHeart />, label: "Công ty theo dõi" },
  ];

  const employerMenus = [
    { to: "/post-job", icon: <FaPlusSquare />, label: "Đăng tin tuyển dụng" },
    {
      to: "/manage-jobs",
      icon: <FaClipboardList />,
      label: "Quản lý tin đăng",
    },
    { to: "/manage-profile", icon: <FaUser />, label: "Quản lý hồ sơ" },
    {
      to: "/applicants",
      icon: <FaUserFriends />,
      label: "Ứng viên ứng tuyển",
      badge:
        totalUnread > 0
          ? totalUnread > 99
            ? "99+"
            : totalUnread
          : undefined,
    },
  ];

  const settingsMenus = [
    { to: "/settings", icon: <FaCog />, label: "Cài đặt" },
  ];

  const renderMenu = (menu: {
    to: string;
    icon: React.ReactElement;
    label: string;
    badge?: number | string;
  }) => {
    const active = location.pathname === menu.to;
    return (
      <Link
        key={menu.to}
        to={menu.to}
        className={`flex items-center justify-between p-2 rounded-lg transition-colors duration-200 ${active
          ? "bg-blue-100 text-blue-600 font-semibold"
          : "hover:bg-gray-100 text-gray-700"
          }`}
      >
        <div className="flex items-center space-x-3">
          <span
            className={`h-5 w-5 ${active ? "text-blue-600" : "text-gray-600"}`}
          >
            {menu.icon}
          </span>
          <span>{menu.label}</span>
        </div>
        {menu.badge !== undefined && menu.badge !== 0 && (
          <span className="bg-blue-600 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
            {menu.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-white h-screen sticky top-0 left-0 overflow-y-auto p-4">
      <nav className="space-y-2">
        {/* Người tìm việc */}
        <h2 className="text-gray-500 uppercase text-xs font-semibold px-2 mb-2">
          Dành cho bạn
        </h2>
        {userMenus.map(renderMenu)}

        <div className="border-t border-gray-200 my-4"></div>

        {/* Nhà tuyển dụng */}
        <h2 className="text-gray-500 uppercase text-xs font-semibold px-2 mb-2">
          Nhà tuyển dụng
        </h2>
        {employerMenus.map(renderMenu)}

        <div className="border-t border-gray-200 my-4"></div>

        {/* Cài đặt */}
        {settingsMenus.map(renderMenu)}

        {/* Đăng xuất */}
        <button
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 w-full text-left transition-colors duration-200 text-gray-700"
          onClick={() => setShowLogoutModal(true)}
        >

          <FaSignOutAlt className="h-5 w-5 text-gray-600" />
          <span>Đăng xuất</span>
        </button>
      </nav>
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?"
        confirmText="Đăng xuất"
        type="warning"
      />
    </aside>
  );

};

export default Sidebar;
