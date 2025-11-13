using Microsoft.Extensions.Caching.Memory;
using Server.Data.Jobs;
using Server.Data.Profiles;
using Server.DTOs.Jobs;
using Server.DTOs.Profiles;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Server.Models.Jobs;

namespace Server.Services.Jobs
{
    public class JobService : IJobService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProfileUnitOfWork _profileUnitOfWork;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;
        private readonly ILogger<JobService> _logger;

        public JobService(IUnitOfWork unitOfWork, IProfileUnitOfWork profileUnitOfWork, IMapper mapper, IMemoryCache cache, ILogger<JobService> logger)
        {
            _unitOfWork = unitOfWork;
            _profileUnitOfWork = profileUnitOfWork;
            _mapper = mapper;
            _cache = cache;
            _logger = logger;
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
            jobDto.Images = await GetJobImagesAsync(jobDto.JobId);

            // Fetch employer profile if EmployerProfileId is set
            if (job.EmployerProfileId.HasValue)
            {
                var employerProfile = await _profileUnitOfWork.ProfileRepository.GetEmployerProfileByIdAsync(job.EmployerProfileId.Value);
                if (employerProfile != null)
                {
                    var employerImages = await _profileUnitOfWork.ProfileRepository.GetEmployerProfileImagesAsync(employerProfile.EmployerId);
                    var employerCompanies = await _profileUnitOfWork.ProfileRepository.GetCompaniesByEmployerIdAsync(employerProfile.EmployerId);

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
                        Companies = (await Task.WhenAll(employerCompanies.Select(async c =>
                        {
                            var companyImages = await _profileUnitOfWork.ProfileRepository.GetCompanyImagesAsync(c.CompanyId);
                            return new CompanyDto
                            {
                                CompanyId = c.CompanyId,
                                Name = c.Name ?? string.Empty,
                                CompanyCode = c.CompanyCode,
                                Website = c.Website,
                                Description = c.Description,
                                Industry = c.Industry,
                                CompanySize = c.CompanySize,
                                FoundedYear = c.FoundedYear,
                                LogoURL = c.LogoURL,
                                Address = c.Address,
                                ContactEmail = c.ContactEmail,
                                CreatedAt = c.CreatedAt,
                                UpdatedAt = c.UpdatedAt,
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
                        }))).ToList()
                    };
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
            job.EmployerProfileId = null; // TODO: Fetch from user profile
            job.CompanyId = jobCreateDto.CompanyId; // Optional

            await _unitOfWork.JobRepository.CreateJobAsync(job);

            // Handle image if provided
            if (jobCreateDto.Image != null)
            {
                var jobImage = _mapper.Map<JobImage>(jobCreateDto.Image);
                jobImage.JobImageId = Guid.NewGuid();
                jobImage.JobId = job.JobId;
                jobImage.UploadedByUserId = userId;
                jobImage.CreatedAt = DateTime.UtcNow;

                await _unitOfWork.JobRepository.CreateJobImageAsync(jobImage);
            }

            await _unitOfWork.SaveChangesAsync();

            // Fetch the created job with Company included
            var createdJob = await _unitOfWork.JobRepository.GetJobByGuidAsync(job.JobGuid);
            var jobDto = _mapper.Map<JobDto>(createdJob);
            return jobDto;
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

            await _unitOfWork.JobRepository.DeleteJobImageAsync(existingImage);
            await _unitOfWork.SaveChangesAsync();
        }
    }


}
