import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { adminService, type AdminDashboardStats, type SystemHealth } from "../../services/adminService";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
    BarChart as ReBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RePieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area
} from "recharts";
import {
    HiOutlineUsers,
    HiOutlineBriefcase,
    HiOutlineDocumentText,
    HiOutlineArrowPath,
    HiOutlineArrowTrendingUp,
    HiOutlineExclamationCircle,
    HiOutlineBolt,
    HiOutlineUserPlus,
    HiOutlineCheckBadge,
    HiOutlineBars3,
    HiOutlineEnvelope,
    HiOutlineShieldCheck
} from "react-icons/hi2";

export const meta = () => {
    return [
        { title: "JobsViet Admin - Dashboard" },
        { name: "description", content: "Bảng điều khiển quản trị JobsViet" }
    ];
};

const CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<AdminDashboardStats | null>(null);
    const [health, setHealth] = useState<SystemHealth | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsData, healthData] = await Promise.all([
                adminService.getStats(),
                adminService.getHealth()
            ]);
            setStats(statsData);
            setHealth(healthData);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch admin data:", err);
            setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const statCards = useMemo(() => [
        {
            title: "Người dùng",
            value: stats?.totalUsers || 0,
            icon: <HiOutlineUsers className="w-6 h-6" />,
            growth: "+12%",
            description: "Thành viên đã tham gia hệ thống",
            color: "blue"
        },
        {
            title: "Công việc",
            value: stats?.totalJobs || 0,
            icon: <HiOutlineBriefcase className="w-6 h-6" />,
            growth: "+5%",
            description: `${stats?.activeJobs || 0} tin đang tuyển dụng`,
            color: "indigo"
        },
        {
            title: "Đơn ứng tuyển",
            value: stats?.totalApplications || 0,
            icon: <HiOutlineDocumentText className="w-6 h-6" />,
            growth: "+24%",
            description: "Lượt nộp hồ sơ từ ứng viên",
            color: "emerald"
        }
    ], [stats]);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "User": return <HiOutlineUserPlus className="w-4 h-4 text-blue-500" />;
            case "Job": return <HiOutlineBolt className="w-4 h-4 text-amber-500" />;
            case "Application": return <HiOutlineDocumentText className="w-4 h-4 text-emerald-500" />;
            default: return <HiOutlineCheckBadge className="w-4 h-4 text-indigo-500" />;
        }
    };

    const iconBoxClasses: Record<string, string> = {
        blue: "p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl",
        indigo: "p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl",
        emerald: "p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl",
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Trung tâm Quản trị</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Theo dõi hoạt động hệ thống JobsViet theo thời gian thực.</p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="group inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/25 active:scale-95 disabled:opacity-50"
                >
                    <HiOutlineArrowPath className={`w-4 h-4 mr-2 transition-transform duration-700 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                    Cập nhật ngay
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center text-red-700 dark:text-red-400 animate-in fade-in slide-in-from-top-2">
                    <HiOutlineExclamationCircle className="w-5 h-5 mr-3" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((card, i) => (
                    <div key={i} className="group bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity duration-500">
                            <div className="scale-[5]">{card.icon}</div>
                        </div>
                        <div className="flex items-center justify-between mb-6 relative">
                            <div className={iconBoxClasses[card.color]}>
                                {card.icon}
                            </div>
                            <div className="flex items-center space-x-1 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
                                <HiOutlineArrowTrendingUp className="w-3 h-3" />
                                <span className="text-[10px] font-black">{card.growth}</span>
                            </div>
                        </div>
                        <div className="relative">
                            <h3 className="text-slate-400 dark:text-slate-500 font-black text-xs uppercase tracking-[0.2em]">{card.title}</h3>
                            <div className="flex items-baseline mt-2">
                                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                                    {loading && !stats ? "..." : card.value.toLocaleString()}
                                </p>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed font-bold">
                                {card.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Application Trends (Area Chart) */}
                <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-gray-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Xu hướng ứng tuyển</h3>
                            <p className="text-xs text-slate-400 mt-1 font-bold">Lượt nộp hồ sơ trong 14 ngày gần nhất</p>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        {loading && !stats ? (
                            <div className="h-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.applicationTrends || []}>
                                    <defs>
                                        <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0f172a',
                                            border: 'none',
                                            borderRadius: '16px',
                                            color: '#fff',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorApp)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* User Roles Distribution */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Phân bổ người dùng</h3>
                    <div className="flex-1 flex items-center justify-center min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={stats?.userRolesDistribution || []}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    nameKey="label"
                                >
                                    {(stats?.userRolesDistribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 2) % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        border: 'none',
                                        borderRadius: '16px',
                                        color: '#fff',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 mt-4">
                        {(stats?.userRolesDistribution || []).map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[(i + 2) % CHART_COLORS.length] }} />
                                    <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-tight">{item.label}</span>
                                </div>
                                <span className="text-sm font-black text-slate-900 dark:text-white">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Registrations Chart */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-gray-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Thành viên mới</h3>
                            <p className="text-xs text-slate-400 mt-1 font-bold">Đăng ký trong 7 ngày gần nhất</p>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReBarChart data={stats?.monthlyRegistrations || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                                <YAxis hide />
                                <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff' }} />
                                <Bar dataKey="value" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={40} />
                            </ReBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Job Categories */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-gray-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Top Ngành nghề</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReBarChart layout="vertical" data={stats?.topJobCategories || []}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="label"
                                    type="category"
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={100}
                                />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }} />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 10, 10, 0]} barSize={20} />
                            </ReBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Application Status Distribution */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Trạng thái hồ sơ</h3>
                    <div className="flex-1 flex items-center justify-center min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie data={stats?.applicationsByStatus || []} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="label">
                                    {(stats?.applicationsByStatus || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }} />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        {(stats?.applicationsByStatus || []).map((item, i) => (
                            <div key={i} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 truncate uppercase">{item.label}</p>
                                    <p className="text-xs font-black text-slate-900 dark:text-white">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Dòng sự kiện</h3>
                            <p className="text-xs text-slate-400 mt-1 font-bold">Các tương tác mới nhất trên toàn hệ thống</p>
                        </div>
                        <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full uppercase tracking-widest">Live Flow</span>
                    </div>

                    <div className="flex-1 space-y-6">
                        {(!stats?.recentActivities || stats.recentActivities.length === 0) ? (
                            <div className="py-20 text-center">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                                    <HiOutlineCheckBadge className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-slate-400 text-xs font-bold">Không có hoạt động nào được ghi nhận</p>
                            </div>
                        ) : (
                            stats.recentActivities.map((act, i) => (
                                <div key={i} className="flex space-x-5 items-start group hover:bg-slate-50 dark:hover:bg-slate-800/50 p-4 -m-4 rounded-[24px] transition-all duration-300">
                                    <div className="mt-1 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                                        {getActivityIcon(act.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-black text-slate-800 dark:text-slate-200 truncate">
                                                {act.title}
                                            </p>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true, locale: vi })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                            {act.message}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* System Monitor */}
                <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden border border-slate-800 flex flex-col">
                    <div className="absolute top-0 right-0 p-10 opacity-10 blur-2xl pointer-events-none">
                        <div className="w-64 h-64 bg-indigo-500 rounded-full" />
                    </div>

                    <div className="relative flex-1">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight">Hệ thống</h3>
                                <p className="text-[10px] text-indigo-400 mt-1 font-bold uppercase tracking-widest">Real-time Monitoring</p>
                            </div>
                            <div className={`flex items-center space-x-2 font-black text-xs uppercase px-3 py-1.5 rounded-full ${health?.status === 'Stable' ? 'text-emerald-400 bg-emerald-400/10' : 'text-amber-400 bg-amber-400/10'}`}>
                                <div className={`w-2 h-2 rounded-full animate-pulse ${health?.status === 'Stable' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                <span>{health?.status || 'Loading...'}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {(health?.services || [
                                { name: "Identity Node", status: "...", performance: "..." },
                                { name: "Image Service", status: "...", performance: "..." },
                                { name: "API Gateway", status: "...", performance: "..." },
                            ]).map((srv) => (
                                <div key={srv.name} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-2 rounded-lg ${srv.status === 'Online' ? 'bg-emerald-500/10 text-emerald-400' : srv.status === 'Offline' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                            {srv.name.includes("API") ? <HiOutlineBolt /> : srv.name.includes("Image") ? <HiOutlineEnvelope /> : <HiOutlineShieldCheck />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black tracking-tight">{srv.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Priority L1</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xs font-black uppercase ${srv.status === 'Online' ? 'text-emerald-400' : srv.status === 'Offline' ? 'text-red-400' : 'text-amber-400'}`}>{srv.status}</p>
                                        <p className="text-[10px] text-slate-500 font-bold">{srv.performance}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-6 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl shadow-xl">
                            <h4 className="text-sm font-black mb-1 uppercase tracking-wider">Tài nguyên Cluster</h4>
                            <p className="text-[10px] text-white/70 mb-4 font-medium italic">Memory & Load Optimization</p>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                                        <span>Memory Usage</span>
                                        <span>{health?.resources.memoryPercentage || 0}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-white transition-all duration-1000 ease-out rounded-full"
                                            style={{ width: `${health?.resources.memoryPercentage || 0}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                                        <span className="text-[10px] font-black uppercase">Peak Load</span>
                                    </div>
                                    <span className="text-xs font-black tracking-tighter">{health?.resources.peakLoad || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
