using Server.DTOs.Jobs;

namespace Server.Services.Jobs
{
    public interface IJobService
    {
        Task<PaginatedResult<JobDto>> GetJobsAsync(JobQueryDto query);
    }
}
