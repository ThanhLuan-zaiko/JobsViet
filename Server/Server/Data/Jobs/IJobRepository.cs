using Server.Models.Jobs;

namespace Server.Data.Jobs
{
    public interface IJobRepository
    {
        Task<List<Job>> GetAllJobsAsync();
        Task<(List<Job> Jobs, int TotalCount)> GetJobsAsync(int page, int pageSize, string? search, string? category);
        Task CreateJobAsync(Job job);
    }
}
