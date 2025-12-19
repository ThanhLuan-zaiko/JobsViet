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

export interface AdminUser {
    userId: string;
    userName: string;
    email: string;
    isActive: boolean;
    createdAt: string;
}

export interface AdminUserDetail extends AdminUser {
    profile?: {
        fullName?: string;
        phone?: string;
        address?: string;
        bio?: string;
        headline?: string;
        skills?: string;
        industry?: string;
        companyName?: string;
    };
    blogs: Array<{
        blogId: string;
        title: string;
        isPublished: boolean;
        createdAt: string;
    }>;
    jobs: Array<{
        jobId: string;
        jobGuid: string;
        title: string;
        isActive: number;
        createdAt: string;
    }>;
}

export const adminService = {
    getStats: async (): Promise<AdminDashboardStats> => {
        const response = await api.get("/v1.0/admin/stats");
        return response.data;
    },
    getHealth: async (): Promise<SystemHealth> => {
        const response = await api.get("/v1.0/admin/health");
        return response.data;
    },
    getUsers: async (page: number = 1, pageSize: number = 25): Promise<{ items: AdminUser[], totalCount: number, page: number, pageSize: number }> => {
        const response = await api.get("/v1.0/admin/users", {
            params: { page, pageSize }
        });
        return response.data;
    },
    getUserDetails: async (id: string): Promise<AdminUserDetail> => {
        const response = await api.get(`/v1.0/admin/users/${id}/details`);
        return response.data;
    },
    updateUserRole: async (id: string, role: string): Promise<void> => {
        await api.put(`/v1.0/admin/users/${id}/role`, { role });
    },
    toggleUserStatus: async (id: string): Promise<boolean> => {
        const response = await api.put(`/v1.0/admin/users/${id}/status`);
        return response.data.isActive;
    }
};
