using Microsoft.Extensions.Caching.Memory;
using Server.Data.Jobs;
using Server.DTOs.Jobs;
using AutoMapper;
using Microsoft.Extensions.Logging;

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
    }

    public class PaginatedResult<T>
    {
        public List<T> Data { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}
