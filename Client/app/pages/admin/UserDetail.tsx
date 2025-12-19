import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { adminService, type AdminUserDetail } from "../../services/adminService";
import {
    HiOutlineArrowLeft,
    HiOutlineUser,
    HiOutlineBookOpen,
    HiOutlineBriefcase,
    HiOutlineCalendarDays,
    HiOutlineEnvelope,
    HiOutlinePhone,
    HiOutlineMapPin,
    HiOutlineLockClosed,
    HiOutlineLockOpen,
    HiOutlineTrash
} from "react-icons/hi2";

export default function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [detail, setDetail] = useState<AdminUserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"overview" | "blogs" | "jobs">("overview");

    useEffect(() => {
        if (id) {
            fetchDetails();
        }
    }, [id]);

    const fetchDetails = async () => {
        try {
            if (!id) return;
            setLoading(true);
            const data = await adminService.getUserDetails(id);
            setDetail(data);
        } catch (error) {
            console.error("Failed to fetch user details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!id || !detail) return;
        try {
            const newStatus = await adminService.toggleUserStatus(id);
            setDetail({ ...detail, isActive: newStatus });
        } catch (error) {
            console.error("Failed to toggle status:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!detail) {
        return (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400 mb-4">Không tìm thấy người dùng này.</p>
                <button
                    onClick={() => navigate("/admin/users")}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate("/admin/users")}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all font-medium"
                >
                    <HiOutlineArrowLeft className="w-5 h-5" />
                    Quay lại
                </button>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleToggleStatus}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${detail.isActive
                                ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-100'
                                : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100'
                            }`}
                    >
                        {detail.isActive ? <HiOutlineLockClosed className="w-5 h-5" /> : <HiOutlineLockOpen className="w-5 h-5" />}
                        {detail.isActive ? "Khóa tài khoản" : "Mở khóa"}
                    </button>
                </div>
            </div>

            {/* Profile Hero Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <div className="px-8 pb-8">
                    <div className="relative flex flex-col md:flex-row gap-6 items-end -mt-12">
                        <div className="w-32 h-32 rounded-3xl bg-white dark:bg-slate-900 p-2 shadow-xl shrink-0">
                            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-4xl font-black shadow-inner">
                                {detail.userName.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div className="flex-1 pb-2 space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white">{detail.userName}</h1>
                                {detail.isActive ? (
                                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Hoạt động
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider rounded-full">
                                        Đã khóa
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                                <div className="flex items-center gap-2">
                                    <HiOutlineEnvelope className="w-4 h-4 text-indigo-500" />
                                    {detail.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <HiOutlineCalendarDays className="w-4 h-4 text-indigo-500" />
                                    Tham gia: {new Date(detail.createdAt).toLocaleDateString("vi-VN")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs & Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Stats & Quick Info */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Thông tin liên hệ</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-indigo-500">
                                    <HiOutlinePhone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase">Số điện thoại</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{detail.profile?.phone || "Chưa cập nhật"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-indigo-500">
                                    <HiOutlineMapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase">Địa chỉ</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">{detail.profile?.address || "Chưa cập nhật"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Hoạt động</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/20">
                                <p className="text-indigo-600 dark:text-indigo-400 text-2xl font-black">{detail.blogs.length}</p>
                                <p className="text-indigo-900/60 dark:text-indigo-400/60 text-xs font-bold uppercase mt-1">Bài viết</p>
                            </div>
                            <div className="p-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-2xl border border-purple-100/50 dark:border-purple-900/20">
                                <p className="text-purple-600 dark:text-purple-400 text-2xl font-black">{detail.jobs.length}</p>
                                <p className="text-purple-900/60 dark:text-purple-400/60 text-xs font-bold uppercase mt-1">Tuyển dụng</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Dynamic Content Tabs */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                        <div className="flex border-b border-gray-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 px-4">
                            {[
                                { id: "overview", label: "Hồ sơ", icon: <HiOutlineUser /> },
                                { id: "blogs", label: `Blogs`, count: detail.blogs.length, icon: <HiOutlineBookOpen /> },
                                { id: "jobs", label: `Tin tuyển dụng`, count: detail.jobs.length, icon: <HiOutlineBriefcase /> },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`
                                        flex items-center gap-2 px-6 py-5 text-sm font-bold transition-all relative
                                        ${activeTab === tab.id
                                            ? 'text-indigo-600 dark:text-indigo-400'
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}
                                    `}
                                >
                                    {tab.icon}
                                    <span className="hidden sm:inline">{tab.label}</span>
                                    {tab.count !== undefined && (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {tab.count}
                                        </span>
                                    )}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-t-full shadow-[0_-2px_8px_rgba(79,70,229,0.3)]" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="p-8 flex-1 overflow-y-auto">
                            {activeTab === "overview" && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                                Thông tin chi tiết
                                            </h4>
                                            <div className="space-y-5">
                                                <div>
                                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1.5">Họ tên đầy đủ</p>
                                                    <p className="text-base font-bold text-slate-900 dark:text-white">{detail.profile?.fullName || "Chưa cập nhật"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1.5">Chức danh / Tiêu đề</p>
                                                    <p className="text-base font-bold text-slate-900 dark:text-white leading-snug">{detail.profile?.headline || "Chưa thiết lập tiêu đề"}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1.5">Lĩnh vực</p>
                                                        <p className="text-base font-bold text-slate-900 dark:text-white">{detail.profile?.industry || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1.5">Công ty</p>
                                                        <p className="text-base font-bold text-slate-900 dark:text-white">{detail.profile?.companyName || "N/A"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                                Giới thiệu bản thân
                                            </h4>
                                            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 leading-relaxed text-slate-600 dark:text-slate-300 italic text-sm">
                                                {detail.profile?.bio || "Người dùng này chưa viết lời giới thiệu bản thân."}
                                            </div>

                                            {detail.profile?.skills && (
                                                <div className="space-y-3">
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Kỹ năng chuyên môn</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {detail.profile.skills.split(',').map((skill, idx) => (
                                                            <span key={idx} className="px-3 py-1.5 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-black rounded-xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
                                                                {skill.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "blogs" && (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    {detail.blogs.length > 0 ? (
                                        detail.blogs.map(blog => (
                                            <div key={blog.blogId} className="group p-5 border border-gray-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-indigo-200 dark:hover:border-indigo-900/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer">
                                                <div className="flex items-center gap-5">
                                                    <div className="h-14 w-14 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                        <HiOutlineBookOpen className="w-7 h-7" />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-black text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 transition-colors">{blog.title}</h5>
                                                        <div className="flex items-center gap-3 mt-1.5">
                                                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{new Date(blog.createdAt).toLocaleDateString("vi-VN")}</span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${blog.isPublished ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                                {blog.isPublished ? 'Công khai' : 'Nháp'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:border-indigo-500 transition-colors">
                                                        Xem bài viết
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-20 text-center space-y-3">
                                            <div className="inline-flex p-4 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-300">
                                                <HiOutlineBookOpen className="w-12 h-12" />
                                            </div>
                                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Chưa có bài viết nào được đăng</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "jobs" && (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    {detail.jobs.length > 0 ? (
                                        detail.jobs.map(job => (
                                            <div key={job.jobId} className="group p-5 border border-gray-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-amber-200 dark:hover:border-amber-900/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer">
                                                <div className="flex items-center gap-5">
                                                    <div className="h-14 w-14 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                        <HiOutlineBriefcase className="w-7 h-7" />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-black text-slate-900 dark:text-white leading-snug group-hover:text-amber-600 transition-colors">{job.title}</h5>
                                                        <div className="flex items-center gap-3 mt-1.5">
                                                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Đăng ngày: {new Date(job.createdAt).toLocaleDateString("vi-VN")}</span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${job.isActive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                                {job.isActive ? 'Đang tuyển' : 'Tạm dừng'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:border-amber-500 transition-colors">
                                                        Chi tiết tuyển dụng
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-20 text-center space-y-3">
                                            <div className="inline-flex p-4 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-300">
                                                <HiOutlineBriefcase className="w-12 h-12" />
                                            </div>
                                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Chưa có tin tuyển dụng nào</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
