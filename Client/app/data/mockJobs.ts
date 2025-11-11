export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  imageUrl: string;
  companyName?: string;
  companyLocation?: string;
}

interface JobDto {
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
  images?: JobImageDto[];
  companyName?: string;
  companyLocation?: string;
}

interface JobImageDto {
  jobImageId: string;
  jobId: string;
  filePath: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  caption?: string;
  sortOrder: number;
  isPrimary: boolean;
  isActive: boolean;
  uploadedByUserId?: string;
  createdAt: string;
  updatedAt?: string;
}

interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function fetchJobs(
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  category?: string
): Promise<{ jobs: Job[]; totalCount: number }> {
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5174/api/v1.0";
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  if (search) params.append("search", search);
  if (category) params.append("category", category);

  const response = await fetch(`${baseUrl}/jobs?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch jobs: ${response.statusText}`);
  }
  const result: PaginatedResult<JobDto> = await response.json();

  const jobs: Job[] = result.data.map((dto) => {
    // Get primary image or first image
    const primaryImage =
      dto.images?.find((img) => img.isPrimary) || dto.images?.[0];
    const imageUrl = primaryImage
      ? `${import.meta.env.VITE_IMAGES_SERVICE || "http://127.0.0.1:8000"}${primaryImage.filePath}`
      : "https://via.placeholder.com/300x200?text=Job+Image";

    return {
      id: dto.jobGuid,
      title: dto.title,
      company: dto.companyName || "Unknown Company",
      location: dto.companyLocation || "Unknown Location",
      salary:
        dto.salaryFrom && dto.salaryTo
          ? `${dto.salaryFrom.toLocaleString()} - ${dto.salaryTo.toLocaleString()} VND`
          : "Negotiable",
      description: dto.description || "No description available",
      imageUrl: imageUrl,
      companyName: dto.companyName,
      companyLocation: dto.companyLocation,
    };
  });

  return { jobs, totalCount: result.totalCount };
}
