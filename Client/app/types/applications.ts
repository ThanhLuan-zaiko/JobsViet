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

