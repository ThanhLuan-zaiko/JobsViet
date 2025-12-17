export interface CandidateProfileSummary {
  headline?: string | null;
  address?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  experienceYears?: number | null;
  educationLevel?: string | null;
  skills?: string | null;
  bio?: string | null;
  linkedInProfile?: string | null;
  portfolioUrl?: string | null;
  avatarPath?: string | null;
  portfolioImagePaths?: string[];
}

// Persisted notification from backend database
export interface PersistedNotification {
  notificationId: string;
  type: string; // "NewApplication" | "ApplicationStatus"
  title: string;
  message: string;
  isRead: boolean;
  relatedJobId?: string | null;
  relatedApplicationId?: string | null;
  createdAt: string;
}

export interface ApplicationItem {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail?: string | null;
  candidatePhone?: string | null;
  status: string;
  appliedAt: string;
  updatedAt?: string | null;
  isViewed: boolean;
  candidateProfile?: CandidateProfileSummary | null;
}

export interface JobApplicationCount {
  jobId: string;
  jobTitle: string;
  applicationCount: number;
  unreadCount: number;
}

export interface ApplicationNotification {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail?: string | null;
  candidateHeadline?: string | null;
  avatarPath?: string | null;
  appliedAt: string;
  isViewed: boolean;
}

export interface EmployerApplicationsSummary {
  totalUnread: number;
  jobCounts: JobApplicationCount[];
  recentNotifications: ApplicationNotification[];
}

export interface MarkJobReadResponse {
  updated: number;
  summary: EmployerApplicationsSummary;
}

// Candidate History Types
export interface CandidateApplicationItem {
  applicationId: string;
  status: string;
  appliedAt: string;
  updatedAt?: string | null;
  isViewedByEmployer: boolean;
  employerViewedAt?: string | null;

  // Job info
  jobId: string;
  jobGuid?: string | null;
  jobTitle: string;
  jobDescription?: string | null;
  employmentType?: string | null;
  location?: string | null;
  salaryFrom?: number | null;
  salaryTo?: number | null;
  hiringStatus?: string | null;
  deadlineDate?: string | null;

  // Company info  
  companyId?: string | null;
  companyName?: string | null;
  companyLogoUrl?: string | null;
  companyAddress?: string | null;
  industry?: string | null;

  // Employer info
  employerName?: string | null;
  employerAvatarPath?: string | null;
}

export interface ApplicationStatusUpdateRequest {
  status: string;
}

export interface ApplicationStatusUpdateResult {
  success: boolean;
  message: string;
  newStatus?: string | null;
  updatedAt?: string | null;
}

export interface StatusNotification {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  oldStatus: string;
  newStatus: string;
  updatedAt: string;
  companyName?: string | null;
  companyLogoUrl?: string | null;
}

// Application status constants
export const APPLICATION_STATUSES = {
  APPLIED: 'APPLIED',
  REVIEWED: 'REVIEWED',
  INTERVIEWING: 'INTERVIEWING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
} as const;

export const STATUS_LABELS: Record<string, string> = {
  APPLIED: 'Đã gửi',
  REVIEWED: 'Đã xem',
  INTERVIEWING: 'Đang phỏng vấn',
  ACCEPTED: 'Đã chấp nhận',
  REJECTED: 'Đã từ chối'
};

export const STATUS_COLORS: Record<string, { bg: string; text: string; gradient?: string }> = {
  APPLIED: { bg: 'bg-blue-100', text: 'text-blue-700', gradient: 'from-blue-500 to-blue-600' },
  REVIEWED: { bg: 'bg-purple-100', text: 'text-purple-700', gradient: 'from-purple-500 to-purple-600' },
  INTERVIEWING: { bg: 'bg-amber-100', text: 'text-amber-700', gradient: 'from-amber-500 to-amber-600' },
  ACCEPTED: { bg: 'bg-emerald-100', text: 'text-emerald-700', gradient: 'from-emerald-500 to-emerald-600' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700', gradient: 'from-red-500 to-red-600' }
};

