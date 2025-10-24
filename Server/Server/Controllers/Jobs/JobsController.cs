using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Services.Jobs;
using Server.DTOs.Jobs;
using Microsoft.AspNetCore.Mvc.Versioning;
using Microsoft.AspNetCore.Antiforgery;
using System.Security.Claims;
using FluentValidation;
using Server.Validators.Jobs;

namespace Server.Controllers.Jobs
{
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    [Authorize]
    public class JobsController : ControllerBase
    {
        private readonly IJobService _jobService;
        private readonly ILogger<JobsController> _logger;

        public JobsController(IJobService jobService, ILogger<JobsController> logger)
        {
            _jobService = jobService;
            _logger = logger;
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
                return CreatedAtAction(nameof(GetJobs), new { id = jobDto.JobId }, jobDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating job for user {UserId}", userId);
                return StatusCode(500, "Internal server error.");
            }
        }
    }
}
