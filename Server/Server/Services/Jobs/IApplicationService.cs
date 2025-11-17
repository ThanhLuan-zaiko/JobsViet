using Server.DTOs.Jobs;

namespace Server.Services.Jobs
{
    public interface IApplicationService
    {
        Task<ApplicationResponseDto> ApplyToJobAsync(Guid jobGuid, Guid userId);
        Task<List<ApplicationDto>> GetApplicationsByEmployerIdAsync(Guid employerId);
        Task<List<ApplicationDto>> GetApplicationsByJobIdAsync(Guid jobId);
        Task<List<JobApplicationCountDto>> GetJobApplicationCountsByEmployerIdAsync(Guid employerId);
    }
}

