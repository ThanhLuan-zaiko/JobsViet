using System;
using System.Linq;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Server.Data.Jobs;
using Server.Data.Profiles;
using Server.DTOs.Jobs;
using Server.Hubs;
using Server.Models.Jobs;
using Server.Models.Profiles;

namespace Server.Services.Jobs
{
    public class ApplicationService : IApplicationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProfileUnitOfWork _profileUnitOfWork;
        private readonly ILogger<ApplicationService> _logger;
        private readonly IHubContext<JobsHub> _hubContext;

        public ApplicationService(
            IUnitOfWork unitOfWork,
            IProfileUnitOfWork profileUnitOfWork,
            ILogger<ApplicationService> logger,
            IHubContext<JobsHub> hubContext)
        {
            _unitOfWork = unitOfWork;
            _profileUnitOfWork = profileUnitOfWork;
            _logger = logger;
            _hubContext = hubContext;
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

            await NotifyEmployerNewApplicationAsync(job, candidateProfile, application);

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
                var job = app.Job ?? await _unitOfWork.JobRepository.GetJobByIdAsync(app.JobId);
                var candidateProfile = await _profileUnitOfWork.ProfileRepository.GetCandidateProfileByIdAsync(app.CandidateId);
                var candidateEmail = candidateProfile != null
                    ? (await _profileUnitOfWork.ProfileRepository.GetUserByIdAsync(candidateProfile.UserId))?.Email
                    : null;
                var avatarPath = candidateProfile != null
                    ? await GetCandidateAvatarPathAsync(candidateProfile.CandidateId)
                    : null;

                applicationDtos.Add(new ApplicationDto
                {
                    ApplicationId = app.ApplicationId,
                    JobId = app.JobId,
                    JobTitle = job?.Title ?? "N/A",
                    CandidateId = app.CandidateId,
                    CandidateName = candidateProfile?.FullName ?? "N/A",
                    CandidateEmail = candidateEmail,
                    CandidatePhone = candidateProfile?.Phone,
                    Status = app.Status,
                    AppliedAt = app.AppliedAt,
                    UpdatedAt = app.UpdatedAt,
                    IsViewed = app.IsViewedByEmployer,
                    CandidateProfile = candidateProfile != null
                        ? CreateCandidateProfileSummary(candidateProfile, avatarPath)
                        : null
                });
            }

            return applicationDtos;
        }

        public async Task<List<ApplicationDto>> GetApplicationsByJobIdAsync(Guid jobId)
        {
            var applications = await _unitOfWork.ApplicationRepository.GetApplicationsByJobIdAsync(jobId);
            var applicationDtos = new List<ApplicationDto>();
            var job = await _unitOfWork.JobRepository.GetJobByIdAsync(jobId);

            foreach (var app in applications)
            {
                var candidateProfile = await _profileUnitOfWork.ProfileRepository.GetCandidateProfileByIdAsync(app.CandidateId);
                var candidateEmail = candidateProfile != null
                    ? (await _profileUnitOfWork.ProfileRepository.GetUserByIdAsync(candidateProfile.UserId))?.Email
                    : null;
                var avatarPath = candidateProfile != null
                    ? await GetCandidateAvatarPathAsync(candidateProfile.CandidateId)
                    : null;

                applicationDtos.Add(new ApplicationDto
                {
                    ApplicationId = app.ApplicationId,
                    JobId = app.JobId,
                    JobTitle = job?.Title ?? "N/A",
                    CandidateId = app.CandidateId,
                    CandidateName = candidateProfile?.FullName ?? "N/A",
                    CandidateEmail = candidateEmail,
                    CandidatePhone = candidateProfile?.Phone,
                    Status = app.Status,
                    AppliedAt = app.AppliedAt,
                    UpdatedAt = app.UpdatedAt,
                    IsViewed = app.IsViewedByEmployer,
                    CandidateProfile = candidateProfile != null
                        ? CreateCandidateProfileSummary(candidateProfile, avatarPath)
                        : null
                });
            }

            return applicationDtos;
        }

        public async Task<List<JobApplicationCountDto>> GetJobApplicationCountsByEmployerIdAsync(Guid employerId)
        {
            var counts = await _unitOfWork.ApplicationRepository.GetApplicationCountsWithUnreadByEmployerIdAsync(employerId);
            return counts.Select(c => new JobApplicationCountDto
            {
                JobId = c.JobId,
                JobTitle = c.JobTitle,
                ApplicationCount = c.TotalCount,
                UnreadCount = c.UnreadCount
            }).ToList();
        }

        public async Task<EmployerApplicationsSummaryDto> GetEmployerApplicationsSummaryAsync(Guid employerId)
        {
            var summary = new EmployerApplicationsSummaryDto();
            var counts = await _unitOfWork.ApplicationRepository.GetApplicationCountsWithUnreadByEmployerIdAsync(employerId);
            summary.JobCounts = counts.Select(c => new JobApplicationCountDto
            {
                JobId = c.JobId,
                JobTitle = c.JobTitle,
                ApplicationCount = c.TotalCount,
                UnreadCount = c.UnreadCount
            }).ToList();

            summary.TotalUnread = await _unitOfWork.ApplicationRepository.GetTotalUnreadApplicationsByEmployerIdAsync(employerId);

            var recentApplications = await _unitOfWork.ApplicationRepository.GetRecentApplicationsByEmployerIdAsync(employerId, 10);

            foreach (var app in recentApplications)
            {
                var candidateProfile = await _profileUnitOfWork.ProfileRepository.GetCandidateProfileByIdAsync(app.CandidateId);
                var candidateEmail = candidateProfile != null
                    ? (await _profileUnitOfWork.ProfileRepository.GetUserByIdAsync(candidateProfile.UserId))?.Email
                    : null;
                var avatarPath = candidateProfile != null
                    ? await GetCandidateAvatarPathAsync(candidateProfile.CandidateId)
                    : null;

                summary.RecentNotifications.Add(new ApplicationNotificationDto
                {
                    ApplicationId = app.ApplicationId,
                    JobId = app.JobId,
                    JobTitle = app.Job?.Title ?? "N/A",
                    CandidateId = app.CandidateId,
                    CandidateName = candidateProfile?.FullName ?? "N/A",
                    CandidateEmail = candidateEmail,
                    CandidateHeadline = candidateProfile?.Headline,
                    AvatarPath = avatarPath,
                    AppliedAt = app.AppliedAt,
                    IsViewed = app.IsViewedByEmployer
                });
            }

            return summary;
        }

        public async Task<int> MarkJobApplicationsAsReadAsync(Guid employerId, Guid jobId)
        {
            return await _unitOfWork.ApplicationRepository.MarkApplicationsAsViewedByJobAsync(employerId, jobId);
        }

        private CandidateProfileSummaryDto CreateCandidateProfileSummary(CandidateProfile profile, string? avatarPath)
        {
            return new CandidateProfileSummaryDto
            {
                Headline = profile.Headline,
                Address = profile.Address,
                Gender = profile.Gender,
                DateOfBirth = profile.DateOfBirth,
                ExperienceYears = profile.ExperienceYears,
                EducationLevel = profile.EducationLevel,
                Skills = profile.Skills,
                Bio = profile.Bio,
                LinkedInProfile = profile.LinkedInProfile,
                PortfolioUrl = profile.PortfolioURL,
                AvatarPath = avatarPath
            };
        }

        private async Task<string?> GetCandidateAvatarPathAsync(Guid candidateId)
        {
            var images = await _profileUnitOfWork.ProfileRepository.GetCandidateProfileImagesAsync(candidateId);
            if (images == null || images.Count == 0)
            {
                return null;
            }

            var primary = images.FirstOrDefault(img => img.IsPrimary == true);
            return primary?.FilePath ?? images.FirstOrDefault()?.FilePath;
        }

        private async Task NotifyEmployerNewApplicationAsync(Job job, CandidateProfile candidateProfile, Application application)
        {
            try
            {
                if (job.PostedByUserId == Guid.Empty)
                {
                    _logger.LogWarning("Job {JobId} does not have a valid poster user ID, skipping notification", job.JobId);
                    return;
                }

                if (job.EmployerProfileId == null)
                {
                    _logger.LogWarning("Job {JobId} does not have an employer profile ID, skipping notification", job.JobId);
                    return;
                }

                var candidateUser = await _profileUnitOfWork.ProfileRepository.GetUserByIdAsync(candidateProfile.UserId);
                var avatarPath = await GetCandidateAvatarPathAsync(candidateProfile.CandidateId);

                var notification = new ApplicationNotificationDto
                {
                    ApplicationId = application.ApplicationId,
                    JobId = job.JobId,
                    JobTitle = job.Title,
                    CandidateId = candidateProfile.CandidateId,
                    CandidateName = candidateProfile.FullName ?? "N/A",
                    CandidateEmail = candidateUser?.Email,
                    CandidateHeadline = candidateProfile.Headline,
                    AvatarPath = avatarPath,
                    AppliedAt = application.AppliedAt,
                    IsViewed = false
                };

                await _hubContext.Clients.User(job.PostedByUserId.ToString())
                    .SendAsync("receiveapplicationnotification", notification);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Unable to notify employer for new application on job {JobId}", job.JobId);
            }
        }
    }
}

