import React, { useState, useEffect } from "react";
import Header from "../pages/auth/Header";
import Sidebar from "../pages/auth/Sidebar";
import Footer from "../pages/auth/Footer";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === "Admin") {
      navigate("/admin");
    }
  }, [user, navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex flex-1">
        <div
          className={`transform transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-64" : "w-0 -translate-x-full"
            } overflow-hidden`}
        >
          <Sidebar />
        </div>
        <main className="flex-1 p-4 overflow-y-auto bg-white">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
