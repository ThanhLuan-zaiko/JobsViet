using Server.DTOs.Jobs;

namespace Server.Services.Jobs
{
    public interface IApplicationService
    {
        Task<ApplicationResponseDto> ApplyToJobAsync(Guid jobGuid, Guid userId);
    }
}

