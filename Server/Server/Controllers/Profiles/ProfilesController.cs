using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.DTOs.Profiles;
using Server.Services.Profiles;
using Microsoft.AspNetCore.Mvc.Versioning;
using FluentValidation;
using Server.Validators.Profiles;

namespace Server.Controllers.Profiles
{
    [Authorize]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    public class ProfilesController : ControllerBase
    {
        private readonly IProfileService _profileService;
        private readonly CandidateProfileCreateValidator _candidateCreateValidator;
        private readonly CandidateProfileUpdateValidator _candidateUpdateValidator;
        private readonly EmployerProfileCreateValidator _employerCreateValidator;
        private readonly EmployerProfileUpdateValidator _employerUpdateValidator;
        private readonly CompanyCreateValidator _companyCreateValidator;
        private readonly CompanyUpdateValidator _companyUpdateValidator;

        public ProfilesController(IProfileService profileService)
        {
            _profileService = profileService;
            _candidateCreateValidator = new CandidateProfileCreateValidator();
            _candidateUpdateValidator = new CandidateProfileUpdateValidator();
            _employerCreateValidator = new EmployerProfileCreateValidator();
            _employerUpdateValidator = new EmployerProfileUpdateValidator();
            _companyCreateValidator = new CompanyCreateValidator();
            _companyUpdateValidator = new CompanyUpdateValidator();
        }

        // Candidate Profile Endpoints
        [HttpGet("candidate")]
        public async Task<IActionResult> GetCandidateProfile()
        {
            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized("Invalid user ID");

            var profile = await _profileService.GetCandidateProfileByUserIdAsync(userId);
            if (profile == null)
                return NotFound("Candidate profile not found");

            return Ok(profile);
        }

        [HttpPost("candidate")]
        public async Task<IActionResult> CreateCandidateProfile([FromBody] CandidateProfileCreateDto dto)
        {
            var validationResult = await _candidateCreateValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
                return BadRequest(validationResult.Errors);

            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized("Invalid user ID");

            try
            {
                var profile = await _profileService.CreateCandidateProfileAsync(userId, dto);
                return CreatedAtAction(nameof(GetCandidateProfile), profile);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("candidate")]
        public async Task<IActionResult> UpdateCandidateProfile([FromBody] CandidateProfileUpdateDto dto)
        {
            var validationResult = await _candidateUpdateValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
                return BadRequest(validationResult.Errors);

            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized("Invalid user ID");

            try
            {
                var profile = await _profileService.UpdateCandidateProfileAsync(userId, dto);
                return Ok(profile);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Employer Profile Endpoints
        [HttpGet("employer")]
        public async Task<IActionResult> GetEmployerProfile()
        {
            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized("Invalid user ID");

            var profile = await _profileService.GetEmployerProfileByUserIdAsync(userId);
            if (profile == null)
                return NotFound("Employer profile not found");

            return Ok(profile);
        }

        [HttpPost("employer")]
        public async Task<IActionResult> CreateEmployerProfile([FromBody] EmployerProfileCreateDto dto)
        {
            var validationResult = await _employerCreateValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
                return BadRequest(validationResult.Errors);

            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized("Invalid user ID");

            try
            {
                var profile = await _profileService.CreateEmployerProfileAsync(userId, dto);
                return CreatedAtAction(nameof(GetEmployerProfile), profile);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("employer")]
        public async Task<IActionResult> UpdateEmployerProfile([FromBody] EmployerProfileUpdateDto dto)
        {
            var validationResult = await _employerUpdateValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
                return BadRequest(validationResult.Errors);

            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized("Invalid user ID");

            try
            {
                var profile = await _profileService.UpdateEmployerProfileAsync(userId, dto);
                return Ok(profile);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Company Endpoints
        [HttpPost("company")]
        public async Task<IActionResult> CreateCompany([FromBody] CompanyCreateDto dto)
        {
            var validationResult = await _companyCreateValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
                return BadRequest(validationResult.Errors);

            try
            {
                var company = await _profileService.CreateCompanyAsync(dto);
                return CreatedAtAction(nameof(GetCompany), new { companyId = company.CompanyId }, company);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("company/{companyId}")]
        public async Task<IActionResult> UpdateCompany(Guid companyId, [FromBody] CompanyUpdateDto dto)
        {
            var validationResult = await _companyUpdateValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
                return BadRequest(validationResult.Errors);

            try
            {
                var company = await _profileService.UpdateCompanyAsync(companyId, dto);
                return Ok(company);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("company/{companyId}")]
        public async Task<IActionResult> GetCompany(Guid companyId)
        {
            try
            {
                var company = await _profileService.GetCompanyByIdAsync(companyId);
                if (company == null)
                    return NotFound("Company not found");

                return Ok(company);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("employer/companies")]
        public async Task<IActionResult> GetEmployerCompanies()
        {
            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized("Invalid user ID");

            // Get employer profile first to get employer ID
            var employerProfile = await _profileService.GetEmployerProfileByUserIdAsync(userId);
            if (employerProfile == null)
                return NotFound("Employer profile not found");

            var companies = await _profileService.GetCompaniesByEmployerIdAsync(employerProfile.EmployerId);
            return Ok(companies);
        }

        // Image Upload Endpoints
        [HttpPost("candidate/images")]
        public async Task<IActionResult> UploadCandidateProfileImage([FromForm] CandidateProfileImageCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized("Invalid user ID");

            // Get candidate profile to get candidate ID
            var candidateProfile = await _profileService.GetCandidateProfileByUserIdAsync(userId);
            if (candidateProfile == null)
                return NotFound("Candidate profile not found");

            try
            {
                var image = await _profileService.UploadCandidateProfileImageAsync(candidateProfile.CandidateId, dto);
                return Created("", image);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("employer/images")]
        public async Task<IActionResult> UploadEmployerProfileImage([FromForm] EmployerProfileImageCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized("Invalid user ID");

            // Get employer profile to get employer ID
            var employerProfile = await _profileService.GetEmployerProfileByUserIdAsync(userId);
            if (employerProfile == null)
                return NotFound("Employer profile not found");

            try
            {
                var image = await _profileService.UploadEmployerProfileImageAsync(employerProfile.EmployerId, dto);
                return Created("", image);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("company/{companyId}/images")]
        public async Task<IActionResult> UploadCompanyImage(Guid companyId, [FromForm] CompanyImageCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var image = await _profileService.UploadCompanyImageAsync(companyId, dto);
                return Created("", image);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Get Images Endpoints
        [HttpGet("candidate/images")]
        public async Task<IActionResult> GetCandidateProfileImages()
        {
            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized("Invalid user ID");

            var candidateProfile = await _profileService.GetCandidateProfileByUserIdAsync(userId);
            if (candidateProfile == null)
                return NotFound("Candidate profile not found");

            var images = await _profileService.GetCandidateProfileImagesAsync(candidateProfile.CandidateId);
            return Ok(images);
        }

        [HttpGet("employer/images")]
        public async Task<IActionResult> GetEmployerProfileImages()
        {
            await HttpContext.Session.LoadAsync();
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized("Invalid user ID");

            var employerProfile = await _profileService.GetEmployerProfileByUserIdAsync(userId);
            if (employerProfile == null)
                return NotFound("Employer profile not found");

            var images = await _profileService.GetEmployerProfileImagesAsync(employerProfile.EmployerId);
            return Ok(images);
        }

        [HttpGet("company/{companyId}/images")]
        public async Task<IActionResult> GetCompanyImages(Guid companyId)
        {
            var images = await _profileService.GetCompanyImagesAsync(companyId);
            return Ok(images);
        }
    }
}
