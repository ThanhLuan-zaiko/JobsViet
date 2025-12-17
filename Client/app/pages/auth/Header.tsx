import React from "react";
import { Link } from "react-router";
import { FaBars } from "react-icons/fa";
import SearchBar from "../../components/SearchBar";
import NotificationBell from "../../components/NotificationBell";
import UserIcon from "../../components/UserIcon";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-white sticky top-0 z-50">
      {/* Left section: Menu icon and Logo */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-gray-800"
        >
          <FaBars className="h-6 w-6" />
        </button>
        <Link to="/" className="flex items-center space-x-1">
          <img src="/LogoJobsViet.png" alt="Logo" className="h-8 w-8" />{" "}
          {/* Assuming you have a favicon */}
          <span className="text-xl font-bold text-gray-800">JobsViet</span>
        </Link>
      </div>

      {/* Middle section: Search bar */}
      <SearchBar />

      {/* Right section: Icons */}
      <div className="flex items-center space-x-4">
        <NotificationBell />
        <UserIcon />
      </div>
    </header>
  );
};

export default Header;
