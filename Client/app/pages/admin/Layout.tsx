import { Outlet, useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router";
import LoggedInUserIcon from "../../components/LoggedInUserIcon";
import {
    HiOutlineHome,
    HiOutlineUsers,
    HiOutlineBriefcase,
    HiOutlineDocumentText,
    HiOutlineCog6Tooth,
    HiOutlineBars3,
    HiOutlineChevronDoubleLeft,
    HiOutlineChevronDoubleRight,
    HiOutlineXMark
} from "react-icons/hi2";

export default function AdminLayout() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        if (!user || user.role !== "Admin") {
            navigate("/home");
        }
    }, [user, navigate]);

    if (!user || user.role !== "Admin") {
        return null;
    }

    const navItems = [
        { name: "Tổng quan", path: "/admin", icon: <HiOutlineHome className="w-5 h-5" /> },
        { name: "Người dùng", path: "/admin/users", icon: <HiOutlineUsers className="w-5 h-5" /> },
        { name: "Công việc", path: "/admin/jobs", icon: <HiOutlineBriefcase className="w-5 h-5" /> },
        // { name: "Ứng tuyển", path: "/admin/applications", icon: <HiOutlineDocumentText className="w-5 h-5" /> },
        // { name: "Cấu hình", path: "/admin/settings", icon: <HiOutlineCog6Tooth className="w-5 h-5" /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-950 font-sans overflow-hidden">
            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 
                transform transition-all duration-300 ease-in-out md:relative md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                ${isCollapsed ? 'md:w-24' : 'md:w-72'}
                w-72
            `}>
                <div className="flex flex-col h-full overflow-hidden relative">
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white md:hidden"
                    >
                        <HiOutlineXMark className="w-6 h-6" />
                    </button>

                    <div className={`p-8 transition-all duration-300 ${isCollapsed ? 'px-4 flex flex-col items-center' : ''}`}>
                        <Link to="/admin" className="flex items-center space-x-3 group min-w-max">
                            <div className="shrink-0 w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/10 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-gray-100 dark:border-slate-700">
                                <img src="/LogoJobsViet.png" alt="Logo" className="w-9 h-9 object-contain" />
                            </div>
                            {!isCollapsed && (
                                <div className="flex flex-col animate-in fade-in slide-in-from-left-2">
                                    <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">JobsViet</span>
                                    <span className="text-indigo-600 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Admin Portal</span>
                                </div>
                            )}
                        </Link>
                    </div>

                    <nav className="flex-1 px-4 mt-4 space-y-1 overflow-y-auto scrollbar-none">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path || (item.path === "/admin" && location.pathname === "/admin/dashboard");
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`
                                        flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group relative
                                        ${isActive
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-semibold'
                                            : 'text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
                                        ${isCollapsed ? 'justify-center px-0' : ''}
                                    `}
                                    title={isCollapsed ? item.name : ""}
                                >
                                    <span className={`shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-500'} transition-colors`}>
                                        {item.icon}
                                    </span>
                                    {!isCollapsed && (
                                        <>
                                            <span className="ml-3.5 whitespace-nowrap animate-in fade-in slide-in-from-left-2">{item.name}</span>
                                            {isActive && (
                                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-[0_0_8px_rgba(79,70,229,0.6)]" />
                                            )}
                                        </>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-6 mt-auto">
                        {isCollapsed ? (
                            <div className="w-10 h-10 mx-auto bg-indigo-600 rounded-xl text-white flex items-center justify-center font-black text-[10px]">V1</div>
                        ) : (
                            <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20 text-center">
                                <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Phiên bản</p>
                                <p className="text-lg font-black italic">v1.2.0-PRO</p>
                            </div>
                        )}

                        {/* Collapse Toggle Button (Desktop Only) */}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden md:flex mt-4 w-full h-10 items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                        >
                            {isCollapsed ? <HiOutlineChevronDoubleRight className="w-5 h-5" /> : <HiOutlineChevronDoubleLeft className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center">
                            <button
                                className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white md:hidden"
                                onClick={() => setIsSidebarOpen(true)}
                            >
                                <HiOutlineBars3 className="h-6 w-6" />
                            </button>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white ml-2 md:ml-0">
                                {navItems.find(item => item.path === location.pathname)?.name || "Dashboard"}
                            </h2>
                        </div>

                        <div className="flex items-center space-x-6">
                            <Link
                                to="/admin"
                                className="text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                            >
                                Trang chủ
                            </Link>
                            <div className="h-6 w-px bg-gray-200 dark:bg-slate-800" />
                            <LoggedInUserIcon />
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto bg-gray-50/50 dark:bg-slate-950/50 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
