using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Services.Jobs;
using Server.DTOs.Jobs;
using Microsoft.AspNetCore.Mvc.Versioning;
using Microsoft.AspNetCore.Antiforgery;
using System.Security.Claims;
using FluentValidation;
using Server.Validators.Jobs;
using Microsoft.AspNetCore.SignalR;
using Server.Hubs;

namespace Server.Controllers.Jobs
{
    [Authorize]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    public class JobsController : ControllerBase
    {
        private readonly IJobService _jobService;
        private readonly IApplicationService _applicationService;
        private readonly ILogger<JobsController> _logger;
        private readonly IHubContext<JobsHub> _hubContext;

        public JobsController(
            IJobService jobService,
            IApplicationService applicationService,
            ILogger<JobsController> logger,
            IHubContext<JobsHub> hubContext)
        {
            _jobService = jobService;
            _applicationService = applicationService;
            _logger = logger;
            _hubContext = hubContext;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetJobs([FromQuery] JobQueryDto query)
        {
            var validator = new JobQueryValidator();
            var validationResult = await validator.ValidateAsync(query);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning("Invalid query parameters: {Errors}", validationResult.Errors);
                return BadRequest(validationResult.Errors);
            }

            var result = await _jobService.GetJobsAsync(query);

            return Ok(result);
        }

        [HttpGet("{jobGuid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetJob(Guid jobGuid)
        {
            var job = await _jobService.GetJobAsync(jobGuid);
            if (job == null)
            {
                return NotFound();
            }
            return Ok(job);
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> CreateJob([FromBody] JobCreateDto jobCreateDto)
        {
            var validator = new JobCreateValidator();
            var validationResult = await validator.ValidateAsync(jobCreateDto);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning("Invalid job creation data: {Errors}", validationResult.Errors);
                return BadRequest(validationResult.Errors);
            }

            // Get user ID from session instead of claims
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized("User not authenticated.");
            }

            try
            {
                var jobDto = await _jobService.CreateJobAsync(jobCreateDto, userId);

                // Broadcast new job to all connected clients
                await _hubContext.Clients.All.SendAsync("receivenewjob", jobDto);
                _logger.LogInformation("Broadcasted new job {JobId} to all clients via SignalR. Connected clients: {Count}", _hubContext.Clients.All, jobDto.JobId);

                return CreatedAtAction(nameof(GetJobs), new { id = jobDto.JobId }, jobDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating job for user {UserId}", userId);
                return StatusCode(500, "Internal server error.");
            }
        }

        // Job Image Upload Endpoints
        [HttpPost("{jobId}/images")]
        public async Task<IActionResult> UploadJobImage(Guid jobId, [FromBody] JobImageCreateDto dto)
        {
            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized("Invalid user ID");

            dto.UploadedByUserId = userId;

            try
            {
                var image = await _jobService.UploadJobImageAsync(jobId, dto, userId);
                return Created("", image);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("images/{imageId}")]
        public async Task<IActionResult> UpdateJobImage(Guid imageId, [FromBody] JobImageCreateDto dto)
        {
            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized("Invalid user ID");

            dto.UploadedByUserId = userId;

            try
            {
                var image = await _jobService.UpdateJobImageAsync(imageId, dto, userId);
                return Ok(image);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{jobId}/images")]
        public async Task<IActionResult> GetJobImages(Guid jobId)
        {
            var images = await _jobService.GetJobImagesAsync(jobId);
            return Ok(images);
        }

        [HttpDelete("images/{imageId}")]
        public async Task<IActionResult> DeleteJobImage(Guid imageId)
        {
            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized("Invalid user ID");

            try
            {
                await _jobService.DeleteJobImageAsync(imageId, userId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Application Endpoint
        [HttpPost("{jobGuid}/apply")]
        [AllowAnonymous]
        public async Task<IActionResult> ApplyToJob(Guid jobGuid)
        {
            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized(new ApplicationResponseDto
                {
                    Message = "Bạn cần đăng nhập để ứng tuyển",
                    MessageType = "error"
                });
            }

            try
            {
                var result = await _applicationService.ApplyToJobAsync(jobGuid, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying to job {JobGuid} for user {UserId}", jobGuid, userId);
                return StatusCode(500, new ApplicationResponseDto
                {
                    Message = "Lỗi hệ thống, vui lòng thử lại",
                    MessageType = "error"
                });
            }
        }

        [HttpGet("my-jobs")]
        public async Task<IActionResult> GetMyJobs()
        {
            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized("User not authenticated.");

            try
            {
                var jobs = await _jobService.GetJobsByUserIdAsync(userId);
                return Ok(jobs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching jobs for user {UserId}", userId);
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpDelete("{jobId}")]
        public async Task<IActionResult> DeleteJob(Guid jobId)
        {
            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized("User not authenticated.");

            try
            {
                await _jobService.DeleteJobAsync(jobId, userId);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting job {JobId} for user {UserId}", jobId, userId);
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{jobId}")]
        public async Task<IActionResult> UpdateJob(Guid jobId, [FromBody] JobCreateDto jobCreateDto)
        {
            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized("User not authenticated.");

            try
            {
                var job = await _jobService.UpdateJobAsync(jobId, jobCreateDto, userId);
                return Ok(job);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating job {JobId} for user {UserId}", jobId, userId);
                return BadRequest(ex.Message);
            }
        }

        [HttpPatch("{jobId}/status")]
        public async Task<IActionResult> ToggleJobStatus(Guid jobId)
        {
            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized("User not authenticated.");

            try
            {
                var job = await _jobService.ToggleJobStatusAsync(jobId, userId);
                return Ok(job);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling status for job {JobId} for user {UserId}", jobId, userId);
                return BadRequest(ex.Message);
            }
        }
    }
}
