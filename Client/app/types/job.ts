export interface JobImageCreateRequest {
  filePath: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  caption?: string;
  sortOrder?: number;
  isPrimary?: boolean;
  isActive?: number;
}

export interface JobCreateRequest {
  title: string;
  description?: string;
  employmentType?: string;
  salaryFrom?: number;
  salaryTo?: number;
  positionsNeeded: number;
  positionsFilled: number;
  deadlineDate?: string; // ISO date string
  minAge?: number;
  maxAge?: number;
  requiredExperienceYears?: number;
  requiredDegree?: string;
  genderPreference?: "Nam" | "Nữ" | "Không yêu cầu";
  skillsRequired?: string;
  categoryId: string; // This should be a valid GUID string
  companyId?: string;
  images?: JobImageCreateRequest[];
}

export interface JobDto {
  jobId: string;
  jobGuid: string;
  title: string;
  description?: string;
  employmentType?: string;
  salaryFrom?: number;
  salaryTo?: number;
  createdAt: string;
  hiringStatus?: string;
  positionsNeeded?: number;
  positionsFilled?: number;
  deadlineDate?: string;
  minAge?: number;
  maxAge?: number;
  requiredExperienceYears?: number;
  requiredDegree?: string;
  genderPreference?: string;
  skillsRequired?: string;
  categoryId?: string;
  imageUrl?: string;
  isActive?: number;
  company?: {
    companyId: string;
    name: string;
    logoURL?: string;
  };
  images?: {
    imageId: string;
    filePath: string;
    isPrimary: boolean;
  }[];
}

export interface CategoryDto {
  categoryId: string;
  name: string;
  description?: string;
}
