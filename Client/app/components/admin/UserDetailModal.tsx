import { useState, useEffect } from "react";
import { adminService, type AdminUserDetail } from "../../services/adminService";
import {
    HiOutlineXMark,
    HiOutlineUser,
    HiOutlineBookOpen,
    HiOutlineBriefcase,
    HiOutlineCalendarDays,
    HiOutlineEnvelope,
    HiOutlineGlobeAlt,
    HiOutlinePhone,
    HiOutlineMapPin
} from "react-icons/hi2";

interface UserDetailModalProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function UserDetailModal({ userId, isOpen, onClose }: UserDetailModalProps) {
    const [detail, setDetail] = useState<AdminUserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"overview" | "blogs" | "jobs">("overview");

    useEffect(() => {
        if (isOpen && userId) {
            fetchDetails();
        }
    }, [isOpen, userId]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const data = await adminService.getUserDetails(userId);
            setDetail(data);
        } catch (error) {
            console.error("Failed to fetch user details:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Chi tiết người dùng</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <HiOutlineXMark className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                ) : detail ? (
                    <>
                        {/* Profile Summary */}
                        <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-black shrink-0 shadow-lg">
                                    {detail.userName.charAt(0).toUpperCase()}
                                </div>
                                <div className="space-y-2 flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{detail.userName}</h3>
                                        {detail.isActive ? (
                                            <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <HiOutlineEnvelope className="w-4 h-4 shrink-0" />
                                            {detail.email}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <HiOutlineCalendarDays className="w-4 h-4 shrink-0" />
                                            Tham gia: {new Date(detail.createdAt).toLocaleDateString("vi-VN")}
                                        </div>
                                        {detail.profile?.phone && (
                                            <div className="flex items-center gap-2">
                                                <HiOutlinePhone className="w-4 h-4 shrink-0" />
                                                {detail.profile.phone}
                                            </div>
                                        )}
                                        {detail.profile?.address && (
                                            <div className="flex items-center gap-2">
                                                <HiOutlineMapPin className="w-4 h-4 shrink-0" />
                                                {detail.profile.address}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100 dark:border-slate-800 px-6">
                            {[
                                { id: "overview", label: "Thông tin", icon: <HiOutlineUser /> },
                                { id: "blogs", label: `Blogs (${detail.blogs.length})`, icon: <HiOutlineBookOpen /> },
                                { id: "jobs", label: `Tuyển dụng (${detail.jobs.length})`, icon: <HiOutlineBriefcase /> },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`
                                        flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all relative
                                        ${activeTab === tab.id
                                            ? 'text-indigo-600 dark:text-indigo-400'
                                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}
                                    `}
                                >
                                    {tab.icon}
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                            {activeTab === "overview" && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Thông tin hồ sơ</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-xs text-slate-400 mb-1">Họ tên</p>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{detail.profile?.fullName || "Chưa cập nhật"}</p>
                                                </div>
                                                {detail.profile?.headline && (
                                                    <div>
                                                        <p className="text-xs text-slate-400 mb-1">Tiêu đề</p>
                                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{detail.profile.headline}</p>
                                                    </div>
                                                )}
                                                {detail.profile?.industry && (
                                                    <div>
                                                        <p className="text-xs text-slate-400 mb-1">Lĩnh vực</p>
                                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{detail.profile.industry}</p>
                                                    </div>
                                                )}
                                                {detail.profile?.companyName && (
                                                    <div>
                                                        <p className="text-xs text-slate-400 mb-1">Công ty</p>
                                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{detail.profile.companyName}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Giới thiệu</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                                {detail.profile?.bio || "Người dùng này chưa có tiểu sử."}
                                            </p>
                                            {detail.profile?.skills && (
                                                <div className="mt-4">
                                                    <p className="text-xs text-slate-400 mb-2">Kỹ năng</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {detail.profile.skills.split(',').map((skill, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-medium rounded-md border border-gray-100 dark:border-slate-600">
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
                                <div className="space-y-4">
                                    {detail.blogs.length > 0 ? (
                                        detail.blogs.map(blog => (
                                            <div key={blog.blogId} className="p-4 border border-gray-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                                        <HiOutlineBookOpen className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{blog.title}</h5>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {new Date(blog.createdAt).toLocaleDateString("vi-VN")} • {blog.isPublished ? 'Công khai' : 'Nháp'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${blog.isPublished ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                                                    {blog.isPublished ? 'PUBLISHED' : 'DRAFT'}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-slate-500">Chưa có bài viết nào.</div>
                                    )}
                                </div>
                            )}

                            {activeTab === "jobs" && (
                                <div className="space-y-4">
                                    {detail.jobs.length > 0 ? (
                                        detail.jobs.map(job => (
                                            <div key={job.jobId} className="p-4 border border-gray-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
                                                        <HiOutlineBriefcase className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{job.title}</h5>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            Đăng ngày: {new Date(job.createdAt).toLocaleDateString("vi-VN")}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${job.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                                                    {job.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-slate-500">Chưa đăng tin tuyển dụng nào.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="p-12 text-center text-slate-500">Không tìm thấy thông tin chi tiết.</div>
                )}

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-right">
                    <button onClick={onClose} className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:scale-105 active:scale-95 transition-all">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
