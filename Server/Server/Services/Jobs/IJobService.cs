using Server.DTOs.Jobs;

namespace Server.Services.Jobs
{
    public interface IJobService
    {
        Task<PaginatedResult<JobDto>> GetJobsAsync(JobQueryDto query);
        Task<JobDto> GetJobAsync(Guid jobGuid);
        Task<JobDto> CreateJobAsync(JobCreateDto jobCreateDto, Guid userId);
        Task<JobImageDto> UploadJobImageAsync(Guid jobId, JobImageCreateDto dto, Guid userId);
        Task<JobImageDto> UpdateJobImageAsync(Guid imageId, JobImageCreateDto dto, Guid userId);
        Task<List<JobImageDto>> GetJobImagesAsync(Guid jobId);
        Task DeleteJobImageAsync(Guid imageId, Guid userId);
        Task<List<JobDto>> GetJobsByUserIdAsync(Guid userId);
        Task DeleteJobAsync(Guid jobId, Guid userId);
        Task<JobDto> UpdateJobAsync(Guid jobId, JobCreateDto jobCreateDto, Guid userId);
        Task<JobDto> ToggleJobStatusAsync(Guid jobId, Guid userId);
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
