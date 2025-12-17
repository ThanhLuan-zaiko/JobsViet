using Server.Models.Jobs;

namespace Server.Data.Jobs
{
    public interface IApplicationRepository
    {
        Task<Application?> GetApplicationByJobIdAndCandidateIdAsync(Guid jobId, Guid candidateId);
        Task<Application> CreateApplicationAsync(Application application);
        Task<bool> HasApplicationAsync(Guid jobId, Guid candidateId);
        Task<List<Application>> GetApplicationsByEmployerIdAsync(Guid employerId);
        Task<List<Application>> GetApplicationsByJobIdAsync(Guid jobId);
        Task<int> GetApplicationCountByJobIdAsync(Guid jobId);
        Task<List<(Guid JobId, string JobTitle, int Count)>> GetApplicationCountsByEmployerIdAsync(Guid employerId);
        Task<List<(Guid JobId, string JobTitle, int TotalCount, int UnreadCount)>> GetApplicationCountsWithUnreadByEmployerIdAsync(Guid employerId);
        Task<int> GetTotalUnreadApplicationsByEmployerIdAsync(Guid employerId);
        Task<List<Application>> GetRecentApplicationsByEmployerIdAsync(Guid employerId, int take);
        Task<int> MarkApplicationsAsViewedByJobAsync(Guid employerId, Guid jobId);
        Task<int> MarkAllApplicationsAsViewedAsync(Guid employerId);
        
        // Candidate history methods
        Task<List<Application>> GetApplicationsByCandidateIdAsync(Guid candidateId);
        Task<Application?> GetApplicationByIdAsync(Guid applicationId);
        Task<Application> UpdateApplicationAsync(Application application);
    }
}

