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

export interface AdminJob {
    jobId: string;
    jobGuid: string;
    title: string;
    companyName: string;
    companyLogoUrl?: string;
    categoryName?: string;
    postedByEmail?: string;
    isActive: number;
    createdAt: string;
    hiringStatus?: string;
    salaryFrom?: number;
    salaryTo?: number;
    deadlineDate?: string;
}

export interface AdminUserDetail extends AdminUser {
    role?: string;
    avatarUrl?: string;
    profile?: {
        fullName?: string;
        phone?: string;
        address?: string;
        bio?: string;
        gender?: string;
        dateOfBirth?: string;
        // Candidate
        headline?: string;
        skills?: string;
        educationLevel?: string;
        experienceYears?: number;
        linkedInProfile?: string;
        portfolioURL?: string;
        portfolioImages?: string[];
        // Employer
        industry?: string;
        website?: string;
        yearsOfExperience?: number;
        position?: string;
        companies: Array<{
            companyId: string;
            name?: string;
            website?: string;
            logoUrl?: string;
            industry?: string;
            companySize?: string;
            address?: string;
            isPrimary: boolean;
        }>;
    };
    blogs: Array<{
        blogId: string;
        title: string;
        isPublished: boolean;
        imageUrl?: string;
        createdAt: string;
    }>;
    jobs: Array<{
        jobId: string;
        jobGuid: string;
        title: string;
        isActive: number;
        companyLogoUrl?: string;
        hiringStatus?: string;
        salaryFrom?: number;
        salaryTo?: number;
        deadlineDate?: string;
        createdAt: string;
    }>;
    applications?: Array<{
        applicationId: string;
        jobGuid: string;
        jobTitle?: string;
        companyName?: string;
        status?: string;
        isViewedByEmployer: boolean;
        appliedAt: string;
    }>;
}

export interface AdminJobDetail extends AdminJob {
    description?: string;
    employmentType?: string;
    positionsNeeded?: number;
    positionsFilled?: number;
    minAge?: number;
    maxAge?: number;
    requiredExperienceYears?: number;
    requiredDegree?: string;
    genderPreference?: string;
    skillsRequired?: string;
    company?: {
        companyId: string;
        name?: string;
        logoUrl?: string;
        website?: string;
        industry?: string;
        companySize?: string;
    };
    applications: Array<{
        applicationId: string;
        candidateId: string;
        candidateName?: string;
        candidateEmail?: string;
        status?: string;
        appliedAt: string;
        isViewedByEmployer: boolean;
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
    updateUserStatus: async (id: string): Promise<boolean> => {
        const response = await api.put(`/v1.0/admin/users/${id}/status`);
        return response.data.isActive;
    },
    getJobs: async (page: number = 1, pageSize: number = 25, search?: string): Promise<{ items: AdminJob[], totalCount: number, page: number, pageSize: number }> => {
        const response = await api.get("/v1.0/admin/jobs", {
            params: { page, pageSize, search }
        });
        return response.data;
    },
    getJobDetails: async (id: string): Promise<AdminJobDetail> => {
        const response = await api.get(`/v1.0/admin/jobs/${id}`);
        return response.data;
    },
    toggleJobStatus: async (id: string): Promise<number> => {
        const response = await api.patch(`/v1.0/admin/jobs/${id}/status`);
        return response.data.isActive;
    },
    deleteJob: async (id: string): Promise<void> => {
        await api.delete(`/v1.0/admin/jobs/${id}`);
    }
};
