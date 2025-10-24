export interface JobCreateRequest {
  title: string;
  description?: string;
  employmentType?: string;
  salaryFrom?: number;
  salaryTo?: number;
  positionsNeeded: number;
  deadlineDate?: string; // ISO date string
  minAge?: number;
  maxAge?: number;
  requiredExperienceYears?: number;
  requiredDegree?: string;
  genderPreference?: "Nam" | "Nữ" | "Không yêu cầu";
  skillsRequired?: string;
  categoryId: string; // This should be a valid GUID string
  companyId?: string;
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
}

export interface CategoryDto {
  categoryId: string;
  name: string;
  description?: string;
}
