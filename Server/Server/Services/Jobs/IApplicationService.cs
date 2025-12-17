using Server.DTOs.Jobs;

namespace Server.Services.Jobs
{
    public interface IApplicationService
    {
        Task<ApplicationResponseDto> ApplyToJobAsync(Guid jobGuid, Guid userId);
        Task<List<ApplicationDto>> GetApplicationsByEmployerIdAsync(Guid employerId);
        Task<List<ApplicationDto>> GetApplicationsByJobIdAsync(Guid jobId);
        Task<List<JobApplicationCountDto>> GetJobApplicationCountsByEmployerIdAsync(Guid employerId);
        Task<EmployerApplicationsSummaryDto> GetEmployerApplicationsSummaryAsync(Guid employerId);
        Task<int> MarkJobApplicationsAsReadAsync(Guid employerId, Guid jobId);
        Task<int> MarkAllApplicationsAsReadAsync(Guid employerId);
        
        // Candidate history methods
        Task<List<CandidateApplicationDto>> GetCandidateApplicationHistoryAsync(Guid userId);
        
        // Status update methods (for employers)
        Task<ApplicationStatusUpdateResultDto> UpdateApplicationStatusAsync(Guid employerId, Guid applicationId, string newStatus);
    }
}

