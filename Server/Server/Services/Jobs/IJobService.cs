using Server.DTOs.Jobs;

namespace Server.Services.Jobs
{
    public interface IJobService
    {
        Task<PaginatedResult<JobDto>> GetJobsAsync(JobQueryDto query);
        Task<JobDto> CreateJobAsync(JobCreateDto jobCreateDto, Guid userId);
        Task<JobImageDto> UploadJobImageAsync(Guid jobId, JobImageCreateDto dto, Guid userId);
        Task<JobImageDto> UpdateJobImageAsync(Guid imageId, JobImageCreateDto dto, Guid userId);
        Task<List<JobImageDto>> GetJobImagesAsync(Guid jobId);
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
