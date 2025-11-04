using Microsoft.Extensions.Caching.Memory;
using Server.Data.Jobs;
using Server.DTOs.Jobs;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Server.Models.Jobs;

namespace Server.Services.Jobs
{
    public class JobService : IJobService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;
        private readonly ILogger<JobService> _logger;

        public JobService(IUnitOfWork unitOfWork, IMapper mapper, IMemoryCache cache, ILogger<JobService> logger)
        {
            _unitOfWork = unitOfWork;
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
            job.HiringStatus = "PENDING_APPROVAL"; // Default as per schema
            job.IsActive = 0; // Pending approval
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

            var jobDto = _mapper.Map<JobDto>(job);
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
    }


}
