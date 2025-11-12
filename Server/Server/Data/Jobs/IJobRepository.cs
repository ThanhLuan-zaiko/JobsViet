using Server.Models.Jobs;

namespace Server.Data.Jobs
{
    public interface IJobRepository
    {
        Task<List<Job>> GetAllJobsAsync();
        Task<(List<Job> Jobs, int TotalCount)> GetJobsAsync(int page, int pageSize, string? search, string? category);
        Task<Job?> GetJobByGuidAsync(Guid jobGuid);
        Task CreateJobAsync(Job job);
        Task CreateJobImageAsync(JobImage jobImage);
        Task<JobImage?> GetJobImageByIdAsync(Guid imageId);
        Task UpdateJobImageAsync(JobImage jobImage);
        Task<List<JobImage>> GetJobImagesByJobIdAsync(Guid jobId);
        Task DeleteJobImageAsync(JobImage jobImage);
    }
}
