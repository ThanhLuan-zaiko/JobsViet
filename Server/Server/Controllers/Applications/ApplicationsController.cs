using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Services.Jobs;
using Server.DTOs.Jobs;
using Microsoft.AspNetCore.Mvc.Versioning;
using Server.Data.Profiles;

namespace Server.Controllers.Applications
{
    [Authorize]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    public class ApplicationsController : ControllerBase
    {
        private readonly IApplicationService _applicationService;
        private readonly IProfileUnitOfWork _profileUnitOfWork;
        private readonly ILogger<ApplicationsController> _logger;

        public ApplicationsController(
            IApplicationService applicationService,
            IProfileUnitOfWork profileUnitOfWork,
            ILogger<ApplicationsController> logger)
        {
            _applicationService = applicationService;
            _profileUnitOfWork = profileUnitOfWork;
            _logger = logger;
        }

        [HttpGet("employer")]
        public async Task<IActionResult> GetApplicationsByEmployer()
        {
            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized("User not authenticated");
            }

            try
            {
                var employerProfile = await _profileUnitOfWork.ProfileRepository.GetEmployerProfileByUserIdAsync(userId);
                if (employerProfile == null)
                {
                    return NotFound("Employer profile not found");
                }

                var applications = await _applicationService.GetApplicationsByEmployerIdAsync(employerProfile.EmployerId);
                return Ok(applications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting applications for employer {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("jobs/{jobId}")]
        public async Task<IActionResult> GetApplicationsByJobId(Guid jobId)
        {
            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized("User not authenticated");
            }

            try
            {
                var applications = await _applicationService.GetApplicationsByJobIdAsync(jobId);
                return Ok(applications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting applications for job {JobId}", jobId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("employer/job-counts")]
        public async Task<IActionResult> GetJobApplicationCounts()
        {
            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized("User not authenticated");
            }

            try
            {
                var employerProfile = await _profileUnitOfWork.ProfileRepository.GetEmployerProfileByUserIdAsync(userId);
                if (employerProfile == null)
                {
                    return NotFound("Employer profile not found");
                }

                var counts = await _applicationService.GetJobApplicationCountsByEmployerIdAsync(employerProfile.EmployerId);
                return Ok(counts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting job application counts for employer {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("employer/summary")]
        public async Task<IActionResult> GetEmployerApplicationsSummary()
        {
            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized("User not authenticated");
            }

            try
            {
                var employerProfile = await _profileUnitOfWork.ProfileRepository.GetEmployerProfileByUserIdAsync(userId);
                if (employerProfile == null)
                {
                    return NotFound("Employer profile not found");
                }

                var summary = await _applicationService.GetEmployerApplicationsSummaryAsync(employerProfile.EmployerId);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting applications summary for employer {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("employer/jobs/{jobId}/mark-read")]
        public async Task<IActionResult> MarkJobApplicationsAsRead(Guid jobId)
        {
            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized("User not authenticated");
            }

            try
            {
                var employerProfile = await _profileUnitOfWork.ProfileRepository.GetEmployerProfileByUserIdAsync(userId);
                if (employerProfile == null)
                {
                    return NotFound("Employer profile not found");
                }

                var updated = await _applicationService.MarkJobApplicationsAsReadAsync(employerProfile.EmployerId, jobId);
                var summary = await _applicationService.GetEmployerApplicationsSummaryAsync(employerProfile.EmployerId);

                return Ok(new
                {
                    updated,
                    summary
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking job {JobId} applications as read", jobId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("employer/mark-all-read")]
        public async Task<IActionResult> MarkAllApplicationsAsRead()
        {
            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized("User not authenticated");
            }

            try
            {
                var employerProfile = await _profileUnitOfWork.ProfileRepository.GetEmployerProfileByUserIdAsync(userId);
                if (employerProfile == null)
                {
                    return NotFound("Employer profile not found");
                }

                var updated = await _applicationService.MarkAllApplicationsAsReadAsync(employerProfile.EmployerId);
                var summary = await _applicationService.GetEmployerApplicationsSummaryAsync(employerProfile.EmployerId);

                return Ok(new
                {
                    updated,
                    summary
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking all applications as read for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        // Candidate history endpoint
        [HttpGet("candidate")]
        public async Task<IActionResult> GetCandidateApplicationHistory()
        {
            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized("User not authenticated");
            }

            try
            {
                var applications = await _applicationService.GetCandidateApplicationHistoryAsync(userId);
                return Ok(applications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting application history for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        // Update application status (for employers)
        [HttpPut("{applicationId}/status")]
        public async Task<IActionResult> UpdateApplicationStatus(Guid applicationId, [FromBody] ApplicationStatusUpdateRequestDto request)
        {
            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized("User not authenticated");
            }

            if (string.IsNullOrWhiteSpace(request?.Status))
            {
                return BadRequest("Status is required");
            }

            try
            {
                var employerProfile = await _profileUnitOfWork.ProfileRepository.GetEmployerProfileByUserIdAsync(userId);
                if (employerProfile == null)
                {
                    return NotFound("Employer profile not found");
                }

                var result = await _applicationService.UpdateApplicationStatusAsync(employerProfile.EmployerId, applicationId, request.Status);
                
                if (!result.Success)
                {
                    return BadRequest(result);
                }
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating application {ApplicationId} status", applicationId);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}

