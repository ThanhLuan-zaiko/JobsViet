using Server.Models.Jobs;

namespace Server.Data.Jobs
{
    public interface IApplicationRepository
    {
        Task<Application?> GetApplicationByJobIdAndCandidateIdAsync(Guid jobId, Guid candidateId);
        Task<Application> CreateApplicationAsync(Application application);
        Task<bool> HasApplicationAsync(Guid jobId, Guid candidateId);
    }
}

