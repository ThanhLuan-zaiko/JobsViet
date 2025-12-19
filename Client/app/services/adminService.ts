import { api } from "./api";

export interface AdminDashboardStats {
    totalUsers: number;
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    recentActivities: Array<{
        type: string;
        title: string;
        message: string;
        createdAt: string;
    }>;
    applicationsByStatus: Array<{ label: string; value: number }>;
    monthlyRegistrations: Array<{ label: string; value: number }>;
    applicationTrends: Array<{ label: string; value: number }>;
    userRolesDistribution: Array<{ label: string; value: number }>;
    topJobCategories: Array<{ label: string; value: number }>;
}

export interface SystemHealth {
    status: string;
    services: Array<{
        name: string;
        status: string;
        performance: string;
    }>;
    resources: {
        memoryPercentage: number;
        peakLoad: string;
    };
}

export const adminService = {
    getStats: async (): Promise<AdminDashboardStats> => {
        const response = await api.get("/v1.0/admin/stats");
        return response.data;
    },
    getHealth: async (): Promise<SystemHealth> => {
        const response = await api.get("/v1.0/admin/health");
        return response.data;
    }
};
