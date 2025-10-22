import React, { useState } from "react";
import { FaUser } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import ChangePasswordForm from "./ChangePasswordForm";

const LoggedInUserIcon: React.FC = () => {
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return null; // Should not render if no user, but added as safeguard
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsModalOpen(!isModalOpen)}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <FaUser className="text-gray-600" />
        <span className="text-sm font-medium">{user.email}</span>
      </button>
      {isModalOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={() => {
                setIsChangePasswordOpen(true);
                setIsModalOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Đổi mật khẩu
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}
      {isChangePasswordOpen && (
        <ChangePasswordForm onClose={() => setIsChangePasswordOpen(false)} />
      )}
    </div>
  );
};

export default LoggedInUserIcon;
