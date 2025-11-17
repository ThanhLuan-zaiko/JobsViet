using Server.Data.Jobs;
using Server.Data.Profiles;
using Server.DTOs.Jobs;
using Server.Models.Jobs;
using Microsoft.Extensions.Logging;

namespace Server.Services.Jobs
{
    public class ApplicationService : IApplicationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProfileUnitOfWork _profileUnitOfWork;
        private readonly ILogger<ApplicationService> _logger;

        public ApplicationService(
            IUnitOfWork unitOfWork,
            IProfileUnitOfWork profileUnitOfWork,
            ILogger<ApplicationService> logger)
        {
            _unitOfWork = unitOfWork;
            _profileUnitOfWork = profileUnitOfWork;
            _logger = logger;
        }

        public async Task<ApplicationResponseDto> ApplyToJobAsync(Guid jobGuid, Guid userId)
        {
            // 1. Kiểm tra job có tồn tại không
            var job = await _unitOfWork.JobRepository.GetJobByGuidAsync(jobGuid);
            if (job == null)
            {
                return new ApplicationResponseDto
                {
                    Message = "Không tìm thấy công việc",
                    MessageType = "error"
                };
            }

            // 2. Kiểm tra người dùng không được ứng tuyển chính công việc của mình
            if (job.PostedByUserId == userId)
            {
                return new ApplicationResponseDto
                {
                    Message = "Bạn không thể ứng tuyển vào công việc do chính bạn đăng",
                    MessageType = "error"
                };
            }

            // 3. Kiểm tra người dùng có hồ sơ ứng viên không
            var candidateProfile = await _profileUnitOfWork.ProfileRepository.GetCandidateProfileByUserIdAsync(userId);
            if (candidateProfile == null)
            {
                return new ApplicationResponseDto
                {
                    Message = "Bạn cần tạo hồ sơ ứng viên trước khi ứng tuyển. Vui lòng hoàn thiện hồ sơ của bạn.",
                    MessageType = "info"
                };
            }

            // 4. Kiểm tra đã ứng tuyển chưa
            var existingApplication = await _unitOfWork.ApplicationRepository.HasApplicationAsync(job.JobId, candidateProfile.CandidateId);
            if (existingApplication)
            {
                return new ApplicationResponseDto
                {
                    Message = "Bạn đã ứng tuyển vào công việc này rồi",
                    MessageType = "warning"
                };
            }

            // 5. Tìm hoặc tạo Resume cho candidate
            var resume = await _unitOfWork.ResumeRepository.GetResumeByCandidateIdAsync(candidateProfile.CandidateId);
            if (resume == null)
            {
                // Tạo resume mặc định nếu chưa có
                resume = new Resume
                {
                    ResumeId = Guid.NewGuid(),
                    CandidateId = candidateProfile.CandidateId,
                    Title = $"CV của {candidateProfile.FullName}",
                    Content = $"Hồ sơ ứng viên: {candidateProfile.FullName}\n" +
                             $"Kinh nghiệm: {candidateProfile.ExperienceYears} năm\n" +
                             $"Kỹ năng: {candidateProfile.Skills}\n" +
                             $"Học vấn: {candidateProfile.EducationLevel}",
                    IsPublic = 0,
                    CreatedAt = DateTime.UtcNow
                };
                await _unitOfWork.ResumeRepository.CreateResumeAsync(resume);
            }

            // 6. Tạo application
            var application = new Application
            {
                ApplicationId = Guid.NewGuid(),
                JobId = job.JobId,
                CandidateId = candidateProfile.CandidateId,
                ResumeId = resume.ResumeId,
                Status = "APPLIED",
                AppliedAt = DateTime.UtcNow
            };

            await _unitOfWork.ApplicationRepository.CreateApplicationAsync(application);

            _logger.LogInformation("User {UserId} applied to job {JobId}", userId, job.JobId);

            return new ApplicationResponseDto
            {
                Message = "Ứng tuyển thành công! Hồ sơ của bạn đã được gửi đến nhà tuyển dụng.",
                MessageType = "success",
                ApplicationId = application.ApplicationId
            };
        }

        public async Task<List<ApplicationDto>> GetApplicationsByEmployerIdAsync(Guid employerId)
        {
            var applications = await _unitOfWork.ApplicationRepository.GetApplicationsByEmployerIdAsync(employerId);
            var applicationDtos = new List<ApplicationDto>();

            foreach (var app in applications)
            {
                var candidateProfile = await _profileUnitOfWork.ProfileRepository.GetCandidateProfileByIdAsync(app.CandidateId);
                var job = app.Job;

                applicationDtos.Add(new ApplicationDto
                {
                    ApplicationId = app.ApplicationId,
                    JobId = app.JobId,
                    JobTitle = job?.Title ?? "N/A",
                    CandidateId = app.CandidateId,
                    CandidateName = candidateProfile?.FullName ?? "N/A",
                    CandidateEmail = candidateProfile != null ? (await _profileUnitOfWork.ProfileRepository.GetUserByIdAsync(candidateProfile.UserId))?.Email : null,
                    CandidatePhone = candidateProfile?.Phone,
                    Status = app.Status,
                    AppliedAt = app.AppliedAt,
                    UpdatedAt = app.UpdatedAt
                });
            }

            return applicationDtos;
        }

        public async Task<List<ApplicationDto>> GetApplicationsByJobIdAsync(Guid jobId)
        {
            var applications = await _unitOfWork.ApplicationRepository.GetApplicationsByJobIdAsync(jobId);
            var applicationDtos = new List<ApplicationDto>();

            foreach (var app in applications)
            {
                var candidateProfile = await _profileUnitOfWork.ProfileRepository.GetCandidateProfileByIdAsync(app.CandidateId);
                var job = await _unitOfWork.JobRepository.GetJobByIdAsync(jobId);

                applicationDtos.Add(new ApplicationDto
                {
                    ApplicationId = app.ApplicationId,
                    JobId = app.JobId,
                    JobTitle = job?.Title ?? "N/A",
                    CandidateId = app.CandidateId,
                    CandidateName = candidateProfile?.FullName ?? "N/A",
                    CandidateEmail = candidateProfile != null ? (await _profileUnitOfWork.ProfileRepository.GetUserByIdAsync(candidateProfile.UserId))?.Email : null,
                    CandidatePhone = candidateProfile?.Phone,
                    Status = app.Status,
                    AppliedAt = app.AppliedAt,
                    UpdatedAt = app.UpdatedAt
                });
            }

            return applicationDtos;
        }

        public async Task<List<JobApplicationCountDto>> GetJobApplicationCountsByEmployerIdAsync(Guid employerId)
        {
            var counts = await _unitOfWork.ApplicationRepository.GetApplicationCountsByEmployerIdAsync(employerId);
            return counts.Select(c => new JobApplicationCountDto
            {
                JobId = c.JobId,
                JobTitle = c.JobTitle,
                ApplicationCount = c.Count
            }).ToList();
        }
    }
}

