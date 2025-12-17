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
using Server.Services.Notifications;

namespace Server.Services.Jobs
{
    public class ApplicationService : IApplicationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProfileUnitOfWork _profileUnitOfWork;
        private readonly ILogger<ApplicationService> _logger;
        private readonly IHubContext<JobsHub> _hubContext;
        private readonly INotificationService _notificationService;

        public ApplicationService(
            IUnitOfWork unitOfWork,
            IProfileUnitOfWork profileUnitOfWork,
            ILogger<ApplicationService> logger,
            IHubContext<JobsHub> hubContext,
            INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _profileUnitOfWork = profileUnitOfWork;
            _logger = logger;
            _hubContext = hubContext;
            _notificationService = notificationService;
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

                var portfolioImages = candidateProfile != null
                    ? await GetCandidatePortfolioImagesAsync(candidateProfile.CandidateId)
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
                        ? CreateCandidateProfileSummary(candidateProfile, avatarPath, portfolioImages)
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

                var portfolioImages = candidateProfile != null
                    ? await GetCandidatePortfolioImagesAsync(candidateProfile.CandidateId)
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
                        ? CreateCandidateProfileSummary(candidateProfile, avatarPath, portfolioImages)
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

        public async Task<int> MarkAllApplicationsAsReadAsync(Guid employerId)
        {
            return await _unitOfWork.ApplicationRepository.MarkAllApplicationsAsViewedAsync(employerId);
        }

        public async Task<List<CandidateApplicationDto>> GetCandidateApplicationHistoryAsync(Guid userId)
        {
            // Get candidate profile
            var candidateProfile = await _profileUnitOfWork.ProfileRepository.GetCandidateProfileByUserIdAsync(userId);
            if (candidateProfile == null)
            {
                return new List<CandidateApplicationDto>();
            }

            var applications = await _unitOfWork.ApplicationRepository.GetApplicationsByCandidateIdAsync(candidateProfile.CandidateId);
            var result = new List<CandidateApplicationDto>();

            foreach (var app in applications)
            {
                var job = app.Job ?? await _unitOfWork.JobRepository.GetJobByIdAsync(app.JobId);
                if (job == null) continue;

                var company = job.CompanyId.HasValue
                    ? await _profileUnitOfWork.ProfileRepository.GetCompanyByIdAsync(job.CompanyId.Value)
                    : null;

                var employerProfile = job.EmployerProfileId.HasValue
                    ? await _profileUnitOfWork.ProfileRepository.GetEmployerProfileByIdAsync(job.EmployerProfileId.Value)
                    : null;

                string? employerAvatarPath = null;
                if (employerProfile != null)
                {
                    var employerImages = await _profileUnitOfWork.ProfileRepository.GetEmployerProfileImagesAsync(employerProfile.EmployerId);
                    employerAvatarPath = employerImages?.FirstOrDefault(i => i.IsPrimary == true)?.FilePath
                                        ?? employerImages?.FirstOrDefault()?.FilePath;
                }

                result.Add(new CandidateApplicationDto
                {
                    ApplicationId = app.ApplicationId,
                    Status = app.Status,
                    AppliedAt = app.AppliedAt,
                    UpdatedAt = app.UpdatedAt,
                    IsViewedByEmployer = app.IsViewedByEmployer,
                    EmployerViewedAt = app.EmployerViewedAt,
                    JobId = job.JobId,
                    JobGuid = job.JobGuid,
                    JobTitle = job.Title,
                    JobDescription = job.Description?.Length > 200 ? job.Description.Substring(0, 200) + "..." : job.Description,
                    EmploymentType = job.EmploymentType,
                    Location = company?.Address,
                    SalaryFrom = job.SalaryFrom,
                    SalaryTo = job.SalaryTo,
                    HiringStatus = job.HiringStatus,
                    DeadlineDate = job.DeadlineDate,
                    CompanyId = company?.CompanyId,
                    CompanyName = company?.Name,
                    CompanyLogoUrl = company?.LogoURL,
                    CompanyAddress = company?.Address,
                    Industry = company?.Industry,
                    EmployerName = employerProfile?.DisplayName,
                    EmployerAvatarPath = employerAvatarPath
                });
            }

            return result;
        }

        public async Task<ApplicationStatusUpdateResultDto> UpdateApplicationStatusAsync(Guid employerId, Guid applicationId, string newStatus)
        {
            // Validate status
            if (!ApplicationStatuses.IsValidStatus(newStatus))
            {
                return new ApplicationStatusUpdateResultDto
                {
                    Success = false,
                    Message = $"Trạng thái không hợp lệ. Các trạng thái hợp lệ: {string.Join(", ", ApplicationStatuses.ValidStatuses)}"
                };
            }

            // Get the application
            var application = await _unitOfWork.ApplicationRepository.GetApplicationByIdAsync(applicationId);
            if (application == null)
            {
                return new ApplicationStatusUpdateResultDto
                {
                    Success = false,
                    Message = "Không tìm thấy hồ sơ ứng tuyển"
                };
            }

            // Verify the employer owns the job
            var job = application.Job ?? await _unitOfWork.JobRepository.GetJobByIdAsync(application.JobId);
            if (job == null || job.EmployerProfileId != employerId)
            {
                return new ApplicationStatusUpdateResultDto
                {
                    Success = false,
                    Message = "Bạn không có quyền cập nhật hồ sơ này"
                };
            }

            var oldStatus = application.Status;
            application.Status = newStatus.ToUpper();
            application.UpdatedAt = DateTime.UtcNow;
            
            // Update PositionsFilled logic
            if (newStatus.ToUpper() == "ACCEPTED" && oldStatus != "ACCEPTED")
            {
                job.PositionsFilled = (job.PositionsFilled ?? 0) + 1;
                // Optional: Check if filled >= needed, maybe close job? For now just track count.
                await _unitOfWork.JobRepository.UpdateJobAsync(job);
            }
            else if (oldStatus == "ACCEPTED" && newStatus.ToUpper() != "ACCEPTED")
            {
                job.PositionsFilled = Math.Max(0, (job.PositionsFilled ?? 0) - 1);
                await _unitOfWork.JobRepository.UpdateJobAsync(job);
            }

            // Mark as viewed if not already
            if (!application.IsViewedByEmployer)
            {
                application.IsViewedByEmployer = true;
                application.EmployerViewedAt = DateTime.UtcNow;
            }

            await _unitOfWork.ApplicationRepository.UpdateApplicationAsync(application);

            _logger.LogInformation("Application {ApplicationId} status updated from {OldStatus} to {NewStatus} by employer {EmployerId}",
                applicationId, oldStatus, newStatus, employerId);

            // Notify candidate about status change via SignalR
            await NotifyCandidateStatusChangeAsync(application, job, oldStatus, newStatus);

            return new ApplicationStatusUpdateResultDto
            {
                Success = true,
                Message = "Cập nhật trạng thái thành công",
                NewStatus = application.Status,
                UpdatedAt = application.UpdatedAt
            };
        }

        private async Task NotifyCandidateStatusChangeAsync(Application application, Job job, string oldStatus, string newStatus)
        {
            try
            {
                // Get candidate profile to find user ID
                var candidateProfile = await _profileUnitOfWork.ProfileRepository.GetCandidateProfileByIdAsync(application.CandidateId);
                if (candidateProfile == null)
                {
                    _logger.LogWarning("Could not find candidate profile for application {ApplicationId}", application.ApplicationId);
                    return;
                }

                var company = job.CompanyId.HasValue
                    ? await _profileUnitOfWork.ProfileRepository.GetCompanyByIdAsync(job.CompanyId.Value)
                    : null;

                var notification = new CandidateStatusNotificationDto
                {
                    ApplicationId = application.ApplicationId,
                    JobId = job.JobId,
                    JobTitle = job.Title,
                    OldStatus = oldStatus,
                    NewStatus = newStatus,
                    UpdatedAt = application.UpdatedAt ?? DateTime.UtcNow,
                    CompanyName = company?.Name,
                    CompanyLogoUrl = company?.LogoURL
                };

                // Send to user-specific group
                await _hubContext.Clients.Group($"user_{candidateProfile.UserId}")
                    .SendAsync("receivestatusupdate", notification);

                // Persist notification to database
                var statusLabel = newStatus switch
                {
                    "REVIEWED" => "Đã xem",
                    "INTERVIEWING" => "Mời phỏng vấn",
                    "ACCEPTED" => "Chấp nhận",
                    "REJECTED" => "Từ chối",
                    _ => newStatus
                };
                
                await _notificationService.CreateNotificationAsync(
                    candidateProfile.UserId,
                    "ApplicationStatus",
                    $"Cập nhật trạng thái hồ sơ",
                    $"Hồ sơ ứng tuyển {job.Title} của bạn đã được cập nhật thành: {statusLabel}",
                    job.JobId,
                    application.ApplicationId
                );

                _logger.LogInformation("Notified candidate {CandidateId} about status change for application {ApplicationId}",
                    candidateProfile.CandidateId, application.ApplicationId);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to notify candidate about status change for application {ApplicationId}", application.ApplicationId);
            }
        }

        private CandidateProfileSummaryDto CreateCandidateProfileSummary(CandidateProfile profile, string? avatarPath, List<string>? portfolioImages)
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
                AvatarPath = avatarPath,
                PortfolioImagePaths = portfolioImages
            };
        }
        
        // Helper to fetch portfolio images (non-primary)
        private async Task<List<string>?> GetCandidatePortfolioImagesAsync(Guid candidateId)
        {
             var images = await _profileUnitOfWork.ProfileRepository.GetCandidateProfileImagesAsync(candidateId);
             if (images == null || images.Count == 0) return null;
             
             // Return all non-primary images, or all images if no primary is set? 
             // Usually portfolio images are supplementary. Let's return all non-primary.
             return images.Where(i => i.IsPrimary != true && !string.IsNullOrEmpty(i.FilePath))
                          .Select(i => i.FilePath!)
                          .ToList();
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

                // Use user-specific group instead of User()
                _logger.LogInformation("Broadcasting to group: user_{UserId}", job.PostedByUserId);
                await _hubContext.Clients.Group($"user_{job.PostedByUserId}")
                    .SendAsync("receiveapplicationnotification", notification);

                // Persist notification to database for employer
                await _notificationService.CreateNotificationAsync(
                    job.PostedByUserId,
                    "NewApplication",
                    $"Ứng viên mới",
                    $"{candidateProfile.FullName ?? "Ứng viên"} đã ứng tuyển vào vị trí {job.Title}",
                    job.JobId,
                    application.ApplicationId
                );
                    
                _logger.LogInformation("Notified employer {UserId} about new application for job {JobId}", 
                    job.PostedByUserId, job.JobId);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Unable to notify employer for new application on job {JobId}", job.JobId);
            }
        }
    }
}

