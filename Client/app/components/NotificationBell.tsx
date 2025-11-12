import React from "react";
import { FaBell } from "react-icons/fa";

const NotificationBell: React.FC = () => {
  return (
    <button className="text-gray-600 hover:text-gray-800">
      <FaBell className="h-6 w-6" />
    </button>
  );
};

export default NotificationBell;
