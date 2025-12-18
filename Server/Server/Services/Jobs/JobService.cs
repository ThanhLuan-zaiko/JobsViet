using Microsoft.Extensions.Caching.Memory;
using Server.Data.Jobs;
using Server.Data.Profiles;
using Server.DTOs.Jobs;
using Server.DTOs.Profiles;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Server.Models.Jobs;
using Server.Models.Profiles;
using Microsoft.AspNetCore.SignalR;
using Server.Hubs;

namespace Server.Services.Jobs
{
    public class JobService : IJobService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProfileUnitOfWork _profileUnitOfWork;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;
        private readonly ILogger<JobService> _logger;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly IHubContext<JobsHub> _hubContext;

        public JobService(IUnitOfWork unitOfWork, IProfileUnitOfWork profileUnitOfWork, IMapper mapper, IMemoryCache cache, ILogger<JobService> logger, IHttpClientFactory httpClientFactory, IConfiguration configuration, IHubContext<JobsHub> hubContext)
        {
            _unitOfWork = unitOfWork;
            _profileUnitOfWork = profileUnitOfWork;
            _mapper = mapper;
            _cache = cache;
            _logger = logger;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _hubContext = hubContext;
        }

        public async Task<PaginatedResult<JobDto>> GetJobsAsync(JobQueryDto query)
        {
            var cacheKey = $"jobs_{query.Page}_{query.PageSize}_{query.Search}_{query.Category}";

            if (!_cache.TryGetValue(cacheKey, out PaginatedResult<JobDto>? cachedResult))
            {
                _logger.LogInformation("Fetching jobs from database for query: {@Query}", query);

                var (jobs, totalCount) = await _unitOfWork.JobRepository.GetJobsAsync(query.Page, query.PageSize, query.Search, query.Category);

                var jobDtos = _mapper.Map<List<JobDto>>(jobs);

                // Load images for each job
                foreach (var jobDto in jobDtos)
                {
                    jobDto.Images = await GetJobImagesAsync(jobDto.JobId);
                }

                cachedResult = new PaginatedResult<JobDto>
                {
                    Data = jobDtos,
                    TotalCount = totalCount,
                    Page = query.Page,
                    PageSize = query.PageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / query.PageSize)
                };

                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetSlidingExpiration(TimeSpan.FromMinutes(10));

                _cache.Set(cacheKey, cachedResult, cacheOptions);
            }
            else
            {
                _logger.LogInformation("Returning cached jobs for key: {CacheKey}", cacheKey);
            }

            return cachedResult!;
        }

        public async Task<JobDto> GetJobAsync(Guid jobGuid)
        {
            var job = await _unitOfWork.JobRepository.GetJobByGuidAsync(jobGuid);
            if (job == null)
            {
                return null!;
            }

            var jobDto = _mapper.Map<JobDto>(job);
            jobDto.PostedByUserId = job.PostedByUserId;
            jobDto.Images = await GetJobImagesAsync(jobDto.JobId);

            // Fetch employer profile if EmployerProfileId is set, otherwise fetch by PostedByUserId
            EmployerProfile? employerProfile = null;
            if (job.EmployerProfileId.HasValue)
            {
                employerProfile = await _profileUnitOfWork.ProfileRepository.GetEmployerProfileByIdAsync(job.EmployerProfileId.Value);
            }
            else
            {
                employerProfile = await _profileUnitOfWork.ProfileRepository.GetEmployerProfileByUserIdAsync(job.PostedByUserId);
            }

            if (employerProfile != null)
            {
                var employerImages = await _profileUnitOfWork.ProfileRepository.GetEmployerProfileImagesAsync(employerProfile.EmployerId);
                var employerCompanies = await _profileUnitOfWork.ProfileRepository.GetEmployerCompaniesByEmployerIdAsync(employerProfile.EmployerId);

                jobDto.EmployerProfile = new EmployerProfileDto
                {
                    EmployerId = employerProfile.EmployerId,
                    UserId = employerProfile.UserId,
                    DisplayName = employerProfile.DisplayName,
                    ContactPhone = employerProfile.ContactPhone,
                    Bio = employerProfile.Bio,
                    Industry = employerProfile.Industry,
                    Position = employerProfile.Position,
                    YearsOfExperience = employerProfile.YearsOfExperience,
                    LinkedInProfile = employerProfile.LinkedInProfile,
                    Website = employerProfile.Website,
                    CreatedAt = employerProfile.CreatedAt,
                    UpdatedAt = employerProfile.UpdatedAt,
                    Images = employerImages.Select(img => new EmployerProfileImageDto
                    {
                        ImageId = img.ImageId,
                        EmployerId = img.EmployerId,
                        FilePath = img.FilePath,
                        FileName = img.FileName,
                        FileSize = img.FileSize,
                        FileType = img.FileType,
                        Caption = img.Caption,
                        SortOrder = img.SortOrder,
                        IsPrimary = img.IsPrimary,
                        IsActive = img.IsActive,
                        UploadedByUserId = img.UploadedByUserId,
                        CreatedAt = img.CreatedAt,
                        UpdatedAt = img.UpdatedAt
                    }).ToList(),
                    Companies = new List<CompanyDto>()
                };
                
                // Process companies sequentially to avoid DbContext concurrency issues
                foreach (var ec in employerCompanies)
                {
                    var company = await _profileUnitOfWork.ProfileRepository.GetCompanyByIdAsync(ec.CompanyId);
                    if (company == null) continue;
                    
                    var companyImages = await _profileUnitOfWork.ProfileRepository.GetCompanyImagesAsync(ec.CompanyId);
                    jobDto.EmployerProfile.Companies.Add(new CompanyDto
                    {
                        CompanyId = company.CompanyId,
                        Name = company.Name ?? string.Empty,
                        CompanyCode = company.CompanyCode,
                        Website = company.Website,
                        Description = company.Description,
                        Industry = company.Industry,
                        CompanySize = company.CompanySize,
                        FoundedYear = company.FoundedYear,
                        LogoURL = company.LogoURL,
                        Address = company.Address,
                        ContactEmail = company.ContactEmail,
                        Role = ec.Role,
                        CreatedAt = company.CreatedAt,
                        UpdatedAt = company.UpdatedAt,
                        Images = companyImages.Select(img => new CompanyImageDto
                        {
                            CompanyImageId = img.CompanyImageId,
                            CompanyId = img.CompanyId,
                            FilePath = img.FilePath,
                            FileName = img.FileName,
                            FileSize = img.FileSize,
                            FileType = img.FileType,
                            Caption = img.Caption,
                            SortOrder = img.SortOrder,
                            IsPrimary = img.IsPrimary,
                            IsActive = img.IsActive,
                            UploadedByUserId = img.UploadedByUserId,
                            CreatedAt = img.CreatedAt,
                            UpdatedAt = img.UpdatedAt
                        }).ToList()
                    });
                }
            }

            // Fetch company details if CompanyId is set
            if (job.CompanyId.HasValue)
            {
                var company = await _profileUnitOfWork.ProfileRepository.GetCompanyByIdAsync(job.CompanyId.Value);
                if (company != null)
                {
                    var companyImages = await _profileUnitOfWork.ProfileRepository.GetCompanyImagesAsync(company.CompanyId);
                    jobDto.Company = new CompanyDto
                    {
                        CompanyId = company.CompanyId,
                        Name = company.Name ?? string.Empty,
                        CompanyCode = company.CompanyCode,
                        Website = company.Website,
                        Description = company.Description,
                        Industry = company.Industry,
                        CompanySize = company.CompanySize,
                        FoundedYear = company.FoundedYear,
                        LogoURL = company.LogoURL,
                        Address = company.Address,
                        ContactEmail = company.ContactEmail,
                        CreatedAt = company.CreatedAt,
                        UpdatedAt = company.UpdatedAt,
                        Images = companyImages.Select(img => new CompanyImageDto
                        {
                            CompanyImageId = img.CompanyImageId,
                            CompanyId = img.CompanyId,
                            FilePath = img.FilePath,
                            FileName = img.FileName,
                            FileSize = img.FileSize,
                            FileType = img.FileType,
                            Caption = img.Caption,
                            SortOrder = img.SortOrder,
                            IsPrimary = img.IsPrimary,
                            IsActive = img.IsActive,
                            UploadedByUserId = img.UploadedByUserId,
                            CreatedAt = img.CreatedAt,
                            UpdatedAt = img.UpdatedAt
                        }).ToList()
                    };
                }
            }

            return jobDto;
        }

        public async Task<JobDto> CreateJobAsync(JobCreateDto jobCreateDto, Guid userId)
        {
            _logger.LogInformation("Creating job for user {UserId}", userId);

            // Check if user has employer profile or is admin/moderator
            // For simplicity, assume user can post if authenticated; in real app, check roles
            // Here, we'll set EmployerProfileId if exists, else null

            var job = _mapper.Map<Job>(jobCreateDto);
            job.JobId = Guid.NewGuid();
            job.JobGuid = Guid.NewGuid();
            job.PostedByUserId = userId;
            job.HiringStatus = "OPEN"; // Auto-approved
            job.IsActive = 1; // Active
            job.CreatedAt = DateTime.UtcNow;
            var employerProfile = await _profileUnitOfWork.ProfileRepository.GetEmployerProfileByUserIdAsync(userId);
            job.EmployerProfileId = employerProfile?.EmployerId;
            job.CompanyId = jobCreateDto.CompanyId; // Optional

            await _unitOfWork.JobRepository.CreateJobAsync(job);

            // Handle images if provided
            if (jobCreateDto.Images != null && jobCreateDto.Images.Any())
            {
                var sortOrder = 0;
                foreach (var imageDto in jobCreateDto.Images)
                {
                    var jobImage = _mapper.Map<JobImage>(imageDto);
                    jobImage.JobImageId = Guid.NewGuid();
                    jobImage.JobId = job.JobId;
                    jobImage.UploadedByUserId = userId;
                    jobImage.SortOrder = sortOrder++;
                    jobImage.CreatedAt = DateTime.UtcNow;

                    await _unitOfWork.JobRepository.CreateJobImageAsync(jobImage);
                }
            }

            await _unitOfWork.SaveChangesAsync();

            InvalidateJobListCache();

            var jobDto = await GetJobAsync(job.JobGuid);
            return jobDto;
        }

        private void InvalidateJobListCache()
        {
            var commonPages = new[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
            var commonPageSizes = new[] { 6, 10, 12, 20, 24, 50 };
            
            foreach (var page in commonPages)
            {
                foreach (var pageSize in commonPageSizes)
                {
                    // Remove cache with no search/category
                    _cache.Remove($"jobs_{page}_{pageSize}__");
                    _cache.Remove($"jobs_{page}_{pageSize}_null_null");
                    _cache.Remove($"jobs_{page}_{pageSize}__null");
                    _cache.Remove($"jobs_{page}_{pageSize}_null_");
                }
            }
            
            _logger.LogInformation("Job list cache invalidated after new job creation");
        }

        public async Task<JobImageDto> UploadJobImageAsync(Guid jobId, JobImageCreateDto dto, Guid userId)
        {
            var jobImage = _mapper.Map<JobImage>(dto);
            jobImage.JobImageId = Guid.NewGuid();
            jobImage.JobId = jobId;
            jobImage.UploadedByUserId = userId;
            jobImage.CreatedAt = DateTime.UtcNow;

            await _unitOfWork.JobRepository.CreateJobImageAsync(jobImage);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<JobImageDto>(jobImage);
        }

        public async Task<JobImageDto> UpdateJobImageAsync(Guid imageId, JobImageCreateDto dto, Guid userId)
        {
            var existingImage = await _unitOfWork.JobRepository.GetJobImageByIdAsync(imageId);
            if (existingImage == null)
                throw new Exception("Job image not found");

            _mapper.Map(dto, existingImage);
            existingImage.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.JobRepository.UpdateJobImageAsync(existingImage);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<JobImageDto>(existingImage);
        }

        public async Task<List<JobImageDto>> GetJobImagesAsync(Guid jobId)
        {
            var images = await _unitOfWork.JobRepository.GetJobImagesByJobIdAsync(jobId);
            return _mapper.Map<List<JobImageDto>>(images);
        }

        public async Task DeleteJobImageAsync(Guid imageId, Guid userId)
        {
            var existingImage = await _unitOfWork.JobRepository.GetJobImageByIdAsync(imageId);
            if (existingImage == null)
                throw new Exception("Job image not found");

            // Optional: Check if the user is authorized to delete (e.g., if they uploaded it)
            if (existingImage.UploadedByUserId != userId)
                throw new Exception("Unauthorized to delete this image");

            // Delete physical file
            try 
            {
                var imagesServiceUrl = _configuration["ImagesService:Url"] ?? "http://127.0.0.1:8000";
                var client = _httpClientFactory.CreateClient();
                // existingImage.FilePath e.g., "/images/job/{userId}/{filename}"
                var deleteUrl = $"{imagesServiceUrl}{existingImage.FilePath}";
                var response = await client.DeleteAsync(deleteUrl);
                
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Failed to delete physical image file: {Url}. Status: {Status}", deleteUrl, response.StatusCode);
                    // Proceed to delete from DB anyway to maintain data consistency
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting physical image file");
            }

            await _unitOfWork.JobRepository.DeleteJobImageAsync(existingImage);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<List<JobDto>> GetJobsByUserIdAsync(Guid userId)
        {
            var jobs = await _unitOfWork.JobRepository.GetJobsByUserIdAsync(userId);
            var jobDtos = _mapper.Map<List<JobDto>>(jobs);

            foreach (var jobDto in jobDtos)
            {
                var job = jobs.First(j => j.JobId == jobDto.JobId);
                
                // Load Images
                jobDto.Images = await GetJobImagesAsync(jobDto.JobId);

                // Load Employer Profile
                EmployerProfile? employerProfile = null;
                if (job.EmployerProfileId.HasValue)
                {
                    employerProfile = await _profileUnitOfWork.ProfileRepository.GetEmployerProfileByIdAsync(job.EmployerProfileId.Value);
                }
                else
                {
                    employerProfile = await _profileUnitOfWork.ProfileRepository.GetEmployerProfileByUserIdAsync(job.PostedByUserId);
                }

                if (employerProfile != null)
                {
                    jobDto.EmployerProfile = _mapper.Map<EmployerProfileDto>(employerProfile);
                }

                // Load Company (if loaded by Repo or needing explicit fetch)
                if (job.Company != null)
                {
                     jobDto.Company = _mapper.Map<CompanyDto>(job.Company);
                }
                else if (job.CompanyId.HasValue)
                {
                     var company = await _profileUnitOfWork.ProfileRepository.GetCompanyByIdAsync(job.CompanyId.Value);
                     if (company != null)
                         jobDto.Company = _mapper.Map<CompanyDto>(company);
                }
            }

            return jobDtos;
        }

        public async Task DeleteJobAsync(Guid jobId, Guid userId)
        {
            var job = await _unitOfWork.JobRepository.GetJobByIdAsync(jobId);
            if (job == null)
            {
                throw new Exception("Job not found");
            }

            if (job.PostedByUserId != userId)
            {
                throw new Exception("Unauthorized to delete this job");
            }

            // Delete all job images first (to avoid foreign key constraint violation)
            var jobImages = await _unitOfWork.JobRepository.GetJobImagesByJobIdAsync(jobId);
            foreach (var image in jobImages)
            {
                // Delete physical file from images service
                try
                {
                    var imagesServiceUrl = _configuration["ImagesService:Url"] ?? "http://127.0.0.1:8000";
                    var client = _httpClientFactory.CreateClient();
                    var deleteUrl = $"{imagesServiceUrl}{image.FilePath}";
                    var response = await client.DeleteAsync(deleteUrl);
                    
                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogWarning("Failed to delete physical image file: {Url}. Status: {Status}", deleteUrl, response.StatusCode);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error deleting physical image file for job {JobId}", jobId);
                }

                // Delete from database
                await _unitOfWork.JobRepository.DeleteJobImageAsync(image);
            }

            // Now delete the job
            await _unitOfWork.JobRepository.DeleteJobAsync(job);
            await _unitOfWork.SaveChangesAsync();
            
            InvalidateJobListCache();

            await _hubContext.Clients.All.SendAsync("JobDeleted", jobId);
        }

        public async Task<JobDto> UpdateJobAsync(Guid jobId, JobCreateDto jobCreateDto, Guid userId)
        {
             var job = await _unitOfWork.JobRepository.GetJobByIdAsync(jobId);
            if (job == null)
            {
                throw new Exception("Job not found");
            }

            if (job.PostedByUserId != userId)
            {
                throw new Exception("Unauthorized to update this job");
            }

            _mapper.Map(jobCreateDto, job);
            
            if (jobCreateDto.CompanyId.HasValue)
            {
                job.CompanyId = jobCreateDto.CompanyId;
            }

            await _unitOfWork.JobRepository.UpdateJobAsync(job);

            // Handle new images if provided
            if (jobCreateDto.Images != null && jobCreateDto.Images.Any())
            {
                // Get current max sort order to append new images correctly
                var currentImages = await _unitOfWork.JobRepository.GetJobImagesByJobIdAsync(jobId);
                var sortOrder = currentImages.Any() ? currentImages.Max(i => i.SortOrder) + 1 : 0;

                foreach (var imageDto in jobCreateDto.Images)
                {
                    var jobImage = _mapper.Map<JobImage>(imageDto);
                    jobImage.JobImageId = Guid.NewGuid();
                    jobImage.JobId = job.JobId;
                    jobImage.UploadedByUserId = userId;
                    jobImage.SortOrder = sortOrder++;
                    jobImage.CreatedAt = DateTime.UtcNow;

                    await _unitOfWork.JobRepository.CreateJobImageAsync(jobImage);
                }
            }
            
            await _unitOfWork.SaveChangesAsync();
            
            InvalidateJobListCache();

            var updatedJobDto = await GetJobAsync(job.JobGuid); // specific Guid getter is safer
            await _hubContext.Clients.All.SendAsync("JobUpdated", updatedJobDto);
            return updatedJobDto;
        }

        public async Task<JobDto> ToggleJobStatusAsync(Guid jobId, Guid userId)
        {
            var job = await _unitOfWork.JobRepository.GetJobByIdIncludingInactiveAsync(jobId);
            if (job == null) throw new Exception("Job not found");

            if (job.PostedByUserId != userId) throw new Exception("Unauthorized to update this job");

            // Toggle status
            if (job.HiringStatus == "OPEN")
            {
                job.HiringStatus = "CLOSED";
                job.IsActive = 0;
            }
            else
            {
                job.HiringStatus = "OPEN";
                job.IsActive = 1;
            }

            await _unitOfWork.JobRepository.UpdateJobAsync(job);
            await _unitOfWork.SaveChangesAsync();

            InvalidateJobListCache();

            // Use the new method that includes inactive jobs
            var updatedJob = await _unitOfWork.JobRepository.GetJobByGuidIncludingInactiveAsync(job.JobGuid);
            if (updatedJob == null) throw new Exception("Job not found after update");
            
            var updatedJobDto = _mapper.Map<JobDto>(updatedJob);
            updatedJobDto.PostedByUserId = updatedJob.PostedByUserId;
            updatedJobDto.Images = await GetJobImagesAsync(updatedJobDto.JobId);
            
            // Load company if available
            if (updatedJob.Company != null)
            {
                updatedJobDto.Company = _mapper.Map<CompanyDto>(updatedJob.Company);
            }
            
            await _hubContext.Clients.All.SendAsync("JobUpdated", updatedJobDto);
            return updatedJobDto;
        }

    }
}
