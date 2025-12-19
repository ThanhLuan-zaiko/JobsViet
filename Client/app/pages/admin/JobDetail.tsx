import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { adminService, type AdminJobDetail } from "../../services/adminService";
import {
    HiOutlineArrowLeft,
    HiOutlineBriefcase,
    HiOutlineMapPin,
    HiOutlineCurrencyDollar,
    HiOutlineCalendar,
    HiOutlineUser,
    HiOutlineEye,
    HiOutlineEyeSlash,
    HiOutlineTrash,
    HiOutlineCheckCircle,
    HiOutlineBuildingOffice,
    HiOutlineGlobeAlt,
    HiOutlineAcademicCap,
    HiOutlineUserGroup,
    HiOutlineClock
} from "react-icons/hi2";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function JobDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [job, setJob] = useState<AdminJobDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchJobDetails();
        }
    }, [id]);

    const fetchJobDetails = async () => {
        try {
            setLoading(true);
            const data = await adminService.getJobDetails(id!);
            setJob(data);
            setError(null);
        } catch (err: any) {
            console.error("Error fetching job details:", err);
            setError(err.response?.data?.message || "Không thể tải thông tin bài đăng");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!job) return;
        try {
            const newStatus = await adminService.toggleJobStatus(job.jobId);
            setJob({ ...job, isActive: newStatus });
        } catch (err: any) {
            alert(err.response?.data?.message || "Lỗi khi cập nhật trạng thái");
        }
    };

    const handleDelete = async () => {
        if (!job) return;
        if (window.confirm("Bạn có chắc chắn muốn xóa bài đăng này vĩnh viễn? Hành động này không thể hoàn tác.")) {
            try {
                await adminService.deleteJob(job.jobId);
                navigate("/admin/jobs");
            } catch (err: any) {
                alert(err.response?.data?.message || "Lỗi khi xóa bài đăng");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <HiOutlineBriefcase className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Đã có lỗi xảy ra</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{error || "Không tìm thấy thông tin bài đăng"}</p>
                <button
                    onClick={() => navigate("/admin/jobs")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium"
                >
                    <HiOutlineArrowLeft className="w-5 h-5" />
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/admin/jobs")}
                        className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                        title="Quay lại"
                    >
                        <HiOutlineArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white truncate max-w-[400px] md:max-w-xl">
                            {job.title}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span>ID: {job.jobGuid}</span>
                            <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
                            <span>Đăng lúc: {format(new Date(job.createdAt), "HH:mm dd/MM/yyyy", { locale: vi })}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleToggleStatus}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${job.isActive === 1
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-800/30'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800/30'
                            }`}
                    >
                        {job.isActive === 1 ? (
                            <>
                                <HiOutlineEyeSlash className="w-5 h-5" />
                                Ẩn bài đăng
                            </>
                        ) : (
                            <>
                                <HiOutlineEye className="w-5 h-5" />
                                Hiển thị
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleDelete}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 dark:bg-rose-900/10 dark:text-rose-400 dark:border-rose-800/30 rounded-lg font-medium transition-all"
                    >
                        <HiOutlineTrash className="w-5 h-5" />
                        Xóa vĩnh viễn
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Job Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-6 space-y-8">
                            {/* Company Info */}
                            {job.company && (
                                <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <div className="w-16 h-16 rounded-lg bg-white dark:bg-slate-800 p-1 flex items-center justify-center border border-slate-200 dark:border-slate-700 flex-shrink-0">
                                        {job.company.logoUrl ? (
                                            <img src={job.company.logoUrl} alt={job.company.name} className="w-full h-full object-contain rounded-md" />
                                        ) : (
                                            <HiOutlineBuildingOffice className="w-8 h-8 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate">
                                            {job.company.name}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-600 dark:text-slate-400">
                                            <span className="flex items-center gap-1.5">
                                                <HiOutlineGlobeAlt className="w-4 h-4 text-indigo-500" />
                                                {job.company.website || "N/A"}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <HiOutlineUserGroup className="w-4 h-4 text-emerald-500" />
                                                Quy mô: {job.company.companySize || "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Essential Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Mức lương</p>
                                    <p className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                        <HiOutlineCurrencyDollar className="w-5 h-5 text-emerald-500" />
                                        {job.salaryFrom && job.salaryTo
                                            ? `${job.salaryFrom.toLocaleString()} - ${job.salaryTo.toLocaleString()} VNĐ`
                                            : "Thỏa thuận"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Loại hình</p>
                                    <p className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                        <HiOutlineClock className="w-5 h-5 text-indigo-500" />
                                        {job.employmentType || "N/A"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Hạn chót</p>
                                    <p className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                        <HiOutlineCalendar className="w-5 h-5 text-rose-500" />
                                        {job.deadlineDate ? format(new Date(job.deadlineDate), "dd/MM/yyyy", { locale: vi }) : "N/A"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Danh mục</p>
                                    <p className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                        <HiOutlineBriefcase className="w-5 h-5 text-amber-500" />
                                        {job.categoryName || "N/A"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Vị trí cần tuyển</p>
                                    <p className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                        <HiOutlineUserGroup className="w-5 h-5 text-blue-500" />
                                        {job.positionsFilled || 0} / {job.positionsNeeded || 0}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Trạng thái tuyển</p>
                                    <p className={`font-semibold flex items-center gap-2 ${job.hiringStatus === 'Urgent' ? 'text-rose-600' : 'text-slate-700 dark:text-slate-200'}`}>
                                        <div className={`w-2 h-2 rounded-full ${job.hiringStatus === 'Urgent' ? 'bg-rose-500 animate-pulse' : 'bg-slate-400'}`}></div>
                                        {job.hiringStatus || "Normal"}
                                    </p>
                                </div>
                            </div>

                            {/* Job Description */}
                            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <h4 className="text-lg font-bold text-slate-800 dark:text-white">Mô tả công việc</h4>
                                <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                                    {job.description || "Chưa có mô tả chi tiết."}
                                </div>
                            </div>

                            {/* Skills Required */}
                            {job.skillsRequired && (
                                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <h4 className="text-lg font-bold text-slate-800 dark:text-white">Kỹ năng yêu cầu</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skillsRequired.split(',').map((skill, index) => (
                                            <span key={index} className="px-3 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-full text-sm font-medium border border-indigo-100 dark:border-indigo-800/30">
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Applications List */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <HiOutlineUserGroup className="w-5 h-5 text-indigo-500" />
                                Danh sách ứng tuyển
                                <span className="ml-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-xs font-medium">
                                    {job.applications.length}
                                </span>
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ứng viên</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày gửi</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lượt xem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {job.applications.length > 0 ? (
                                        job.applications.map((app) => (
                                            <tr key={app.applicationId} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-800 dark:text-slate-200">{app.candidateName}</div>
                                                    <div className="text-xs text-slate-500">{app.candidateEmail}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                    {format(new Date(app.appliedAt), "dd/MM/yyyy")}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${app.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' :
                                                        app.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                                                            'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {app.isViewedByEmployer ? (
                                                        <span className="text-indigo-600 text-xs flex items-center gap-1">
                                                            <HiOutlineEye className="w-4 h-4" /> Đã xem
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs">Chưa xem</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 italic">
                                                Chưa có lượt ứng tuyển nào.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Requirements & Poster */}
                <div className="space-y-6">
                    {/* Poster Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden p-6">
                        <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">Thông tin người đăng</h4>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <HiOutlineUser className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                    {job.postedByEmail}
                                </p>
                                <p className="text-xs text-slate-500">Người tuyển dụng</p>
                            </div>
                        </div>
                    </div>

                    {/* Requirements Summary */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden p-6 space-y-4">
                        <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Điều kiện ứng tuyển</h4>

                        <div className="space-y-4 pt-2">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
                                    <HiOutlineAcademicCap className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-tighter">Bằng cấp</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{job.requiredDegree || "Tất cả"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                                    <HiOutlineBriefcase className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-tighter">Kinh nghiệm</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">
                                        {job.requiredExperienceYears ? `${job.requiredExperienceYears} năm` : "Không yêu cầu"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-600 dark:text-rose-400 shrink-0">
                                    <HiOutlineUser className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-tighter">Độ tuổi</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">
                                        {job.minAge && job.maxAge ? `${job.minAge} - ${job.maxAge} tuổi` : "Tất cả"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
                                    <HiOutlineCheckCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-tighter">Giới tính</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{job.genderPreference || "Không giới hạn"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
