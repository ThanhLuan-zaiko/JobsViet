import { useState, useEffect, useCallback } from "react";
import { adminService, type AdminJob } from "../../services/adminService";
import {
    HiOutlineMagnifyingGlass,
    HiOutlineEye,
    HiOutlineTrash,
    HiOutlineEyeSlash,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineBriefcase,
    HiOutlineCheckCircle
} from "react-icons/hi2";
import { useNavigate } from "react-router";
import { useSignalR } from "../../contexts/SignalRContext";
import { useAuth } from "../../contexts/AuthContext";

export const meta = () => {
    return [
        { title: "JobsViet Admin - Quản lý tin tuyển dụng" }
    ];
};

export default function AdminJobs() {
    const navigate = useNavigate();
    const { setNotification } = useAuth();
    const { subscribe, isConnected } = useSignalR();

    const [jobs, setJobs] = useState<AdminJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [newJobsCount, setNewJobsCount] = useState(0);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [totalCount, setTotalCount] = useState(0);

    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);
            const data = await adminService.getJobs(currentPage, pageSize, searchTerm);
            setJobs(data.items);
            setTotalCount(data.totalCount);
            setNewJobsCount(0);
        } catch (error) {
            console.error("Failed to fetch jobs:", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchTerm]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    // SignalR Real-time update
    useEffect(() => {
        if (!isConnected) return;

        const unsubscribe = subscribe("receivenewjob", (newJob: any) => {
            // Map incoming JobDto to AdminJob structure
            const mappedJob: AdminJob = {
                jobId: newJob.jobId,
                jobGuid: newJob.jobGuid,
                title: newJob.title,
                companyName: newJob.companyName || newJob.company?.name || "N/A",
                companyLogoUrl: newJob.company?.logoURL ? `/images${newJob.company.logoURL}` : undefined,
                categoryName: "Mới đăng",
                postedByEmail: "Vừa mới đăng",
                isActive: newJob.isActive,
                createdAt: newJob.createdAt,
                hiringStatus: newJob.hiringStatus,
                salaryFrom: newJob.salaryFrom,
                salaryTo: newJob.salaryTo,
                deadlineDate: newJob.deadlineDate
            };

            // Check if we are on the first page and no search filter is active
            if (currentPage === 1 && !searchTerm) {
                setJobs(prev => [mappedJob, ...prev].slice(0, pageSize));
                setTotalCount(prev => prev + 1);
            } else {
                setNewJobsCount(prev => prev + 1);
            }

            setNotification({
                message: `Có tin tuyển dụng mới: ${mappedJob.title}`,
                type: "success"
            });
        });

        return () => unsubscribe();
    }, [isConnected, subscribe, currentPage, searchTerm, pageSize, setNotification]);

    const handleToggleStatus = async (jobId: string) => {
        try {
            const newStatus = await adminService.toggleJobStatus(jobId);
            setJobs(jobs.map(j => j.jobId === jobId ? { ...j, isActive: newStatus } : j));
            setNotification({
                message: `Đã ${newStatus === 1 ? 'hiển thị' : 'ẩn'} bài đăng thành công`,
                type: "success"
            });
        } catch (error: any) {
            setNotification({
                message: error.response?.data?.message || "Không thể cập nhật trạng thái",
                type: "error"
            });
        }
    };

    const handleDelete = async (jobId: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn tác.")) return;

        try {
            await adminService.deleteJob(jobId);
            setJobs(jobs.filter(j => j.jobId !== jobId));
            setTotalCount(prev => prev - 1);
            setNotification({
                message: "Đã xóa bài đăng thành công",
                type: "success"
            });
        } catch (error: any) {
            setNotification({
                message: error.response?.data?.message || "Không thể xóa bài đăng",
                type: "error"
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý tin tuyển dụng</h1>
                    <p className="text-slate-500 dark:text-slate-400">Xem và kiểm duyệt tất cả bài đăng trong hệ thống</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {newJobsCount > 0 && (
                        <button
                            onClick={() => {
                                setCurrentPage(1);
                                setSearchTerm("");
                                fetchJobs();
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                        >
                            <HiOutlineCheckCircle className="w-5 h-5" />
                            {newJobsCount} tin mới - Tải lại
                        </button>
                    )}
                    <div className="relative w-full md:w-80">
                        <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm tin hoặc công ty..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Công việc & Công ty</th>
                                <th className="px-6 py-4">Người đăng</th>
                                <th className="px-6 py-4">Thông tin</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                            {loading && jobs.length === 0 ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-12 w-64 bg-gray-100 dark:bg-slate-800 rounded-lg"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-32 bg-gray-100 dark:bg-slate-800 rounded-full"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-24 bg-gray-100 dark:bg-slate-800 rounded-full"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-100 dark:bg-slate-800 rounded-full"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 w-16 bg-gray-100 dark:bg-slate-800 rounded-lg ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : jobs.length > 0 ? (
                                jobs.map((job) => (
                                    <tr key={job.jobId} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-slate-700">
                                                    {job.companyLogoUrl ? (
                                                        <img src={job.companyLogoUrl} alt={job.companyName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800">
                                                            <HiOutlineBriefcase className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{job.title}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{job.companyName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600 dark:text-slate-300">{job.postedByEmail || "Ẩn danh"}</p>
                                            <p className="text-[10px] text-slate-400">{new Date(job.createdAt).toLocaleString("vi-VN")}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                    {job.categoryName || "Chưa phân loại"}
                                                </span>
                                                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                    {job.salaryFrom && job.salaryTo ? `${job.salaryFrom.toLocaleString()} - ${job.salaryTo.toLocaleString()}` : "Thỏa thuận"}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${job.isActive === 1 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                {job.isActive === 1 ? 'Đang hiển thị' : 'Đang ẩn'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => navigate(`/admin/jobs/${job.jobId}`)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                                                    title="Xem chi tiết (Admin)"
                                                >
                                                    <HiOutlineEye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(job.jobId)}
                                                    className={`p-2 rounded-lg transition-all ${job.isActive === 1 ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                                                    title={job.isActive === 1 ? "Ẩn bài đăng" : "Hiển thị bài đăng"}
                                                >
                                                    {job.isActive === 1 ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineCheckCircle className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(job.jobId)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                                                    title="Xóa vĩnh viễn"
                                                >
                                                    <HiOutlineTrash className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        Không tìm thấy bài đăng nào phù hợp
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalCount > 0 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
                    <div className="text-sm text-slate-500 dark:text-slate-400 text-center md:text-left">
                        Hiển thị <strong>{(currentPage - 1) * pageSize + 1}</strong> đến <strong>{Math.min(currentPage * pageSize, totalCount)}</strong> trong tổng số <strong>{totalCount}</strong> bài đăng
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || loading}
                            className="p-2 border border-gray-200 dark:border-slate-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <HiOutlineChevronLeft className="w-5 h-5 dark:text-white" />
                        </button>

                        <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.ceil(totalCount / pageSize) }, (_, i) => i + 1)
                                .filter(page => {
                                    const totalPages = Math.ceil(totalCount / pageSize);
                                    if (totalPages <= 5) return true;
                                    if (page === 1 || page === totalPages) return true;
                                    return Math.abs(page - currentPage) <= 1;
                                })
                                .map((page, index, array) => (
                                    <div key={page} className="flex items-center">
                                        {index > 0 && array[index - 1] !== page - 1 && (
                                            <span className="px-2 text-slate-400">...</span>
                                        )}
                                        <button
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${currentPage === page
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-700'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    </div>
                                ))
                            }
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalCount / pageSize), prev + 1))}
                            disabled={currentPage === Math.ceil(totalCount / pageSize) || loading}
                            className="p-2 border border-gray-200 dark:border-slate-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <HiOutlineChevronRight className="w-5 h-5 dark:text-white" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
