import { useState, useEffect } from "react";
import { adminService, type AdminUser } from "../../services/adminService";
import {
    HiOutlineMagnifyingGlass,
    HiOutlineEye,
    HiOutlineLockClosed,
    HiOutlineLockOpen,
    HiOutlineChevronLeft,
    HiOutlineChevronRight
} from "react-icons/hi2";
import { useNavigate } from "react-router";

export const meta = () => {
    return [
        { title: "JobsViet Admin - Quản lý người dùng" }
    ];
};

export default function AdminUsers() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetchUsers();
    }, [currentPage, pageSize]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getUsers(currentPage, pageSize);
            setUsers(data.items);
            setTotalCount(data.totalCount);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId: string) => {
        try {
            await adminService.toggleUserStatus(userId);
            setUsers(users.map(u => u.userId === userId ? { ...u, isActive: !u.isActive } : u));
        } catch (error) {
            console.error("Failed to toggle status:", error);
        }
    };

    const filteredUsers = users.filter(user =>
        user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý người dùng</h1>
                    <p className="text-slate-500 dark:text-slate-400">Xem và quản lý tất cả người dùng trong hệ thống</p>
                </div>

                <div className="relative w-full md:w-96">
                    <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Người dùng</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Ngày tham gia</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-10 w-48 bg-gray-100 dark:bg-slate-800 rounded-lg"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-100 dark:bg-slate-800 rounded-full"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-24 bg-gray-100 dark:bg-slate-800 rounded-full"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 dark:bg-slate-800 rounded"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-gray-100 dark:bg-slate-800 rounded-lg ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.userId} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                                    {user.userName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.userName}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center text-xs font-medium ${user.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${user.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                                {user.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => navigate(`/admin/users/${user.userId}`)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                                                    title="Xem chi tiết"
                                                >
                                                    <HiOutlineEye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(user.userId)}
                                                    className={`p-2 rounded-lg transition-all ${user.isActive ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                                                    title={user.isActive ? "Khóa tài khoản" : "Kích hoạt tài khoản"}
                                                >
                                                    {user.isActive ? <HiOutlineLockClosed className="w-5 h-5" /> : <HiOutlineLockOpen className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        Không tìm thấy người dùng nào phù hợp
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
                <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                    <span>Hiển thị</span>
                    <select
                        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        {[25, 50, 75, 100].map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                    <span>trong tổng số {totalCount} người dùng</span>
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
                                if (totalPages <= 7) return true;
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
                                            ? 'bg-indigo-600 text-white'
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
                        disabled={currentPage === Math.ceil(totalCount / pageSize) || loading || totalCount === 0}
                        className="p-2 border border-gray-200 dark:border-slate-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <HiOutlineChevronRight className="w-5 h-5 dark:text-white" />
                    </button>
                </div>
            </div>

        </div>
    );
}
