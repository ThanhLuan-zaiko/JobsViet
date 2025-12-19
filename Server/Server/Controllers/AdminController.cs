using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Server.Data.Jobs;
using Server.DTOs.Admin;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/v{version:apiVersion}/admin")]
    [ApiVersion("1.0")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AdminController> _logger;

        public AdminController(ApplicationDbContext context, IConfiguration configuration, ILogger<AdminController> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
            {
                var totalUsers = await _context.Users.CountAsync();
                var totalJobs = await _context.Jobs.CountAsync();
                var activeJobs = await _context.Jobs.CountAsync(j => j.IsActive == 1);
                var totalApplications = await _context.Applications.CountAsync();

                // 1. Recent Activities
                var recentUsers = await _context.Users
                    .OrderByDescending(u => u.CreatedAt)
                    .Take(5)
                    .Select(u => new DashboardActivityDto
                    {
                        Type = "User",
                        Title = u.Email,
                        Message = "đã đăng ký tài khoản mới",
                        CreatedAt = u.CreatedAt
                    }).ToListAsync();

                var recentJobs = await _context.Jobs
                    .OrderByDescending(j => j.CreatedAt)
                    .Take(5)
                    .Select(j => new DashboardActivityDto
                    {
                        Type = "Job",
                        Title = j.Title,
                        Message = "đã được đăng tải",
                        CreatedAt = j.CreatedAt
                    }).ToListAsync();

                var recentApps = await _context.Applications
                    .OrderByDescending(a => a.AppliedAt)
                    .Include(a => a.Job)
                    .Take(5)
                    .Select(a => new DashboardActivityDto
                    {
                        Type = "Application",
                        Title = "Ứng viên",
                        Message = "đã ứng tuyển vào công việc mới",
                        CreatedAt = a.AppliedAt
                    }).ToListAsync();

                var allActivities = recentUsers.Concat(recentJobs).Concat(recentApps)
                    .OrderByDescending(a => a.CreatedAt)
                    .Take(10)
                    .ToList();

                // 2. Applications By Status (For Pie Chart)
                var appsByStatus = await _context.Applications
                    .GroupBy(a => a.Status)
                    .Select(g => new DashboardChartItemDto
                    {
                        Label = g.Key,
                        Value = g.Count()
                    }).ToListAsync();

                // 3. Monthly Metrics (registrations last 7 days)
                var sevenDaysAgo = DateTime.UtcNow.AddDays(-7).Date;
                var usersLast7Days = await _context.Users
                    .Where(u => u.CreatedAt >= sevenDaysAgo)
                    .Select(u => new { u.CreatedAt })
                    .ToListAsync();

                var dailyRegs = usersLast7Days
                    .GroupBy(u => u.CreatedAt.Date)
                    .Select(g => new DashboardChartItemDto
                    {
                        Label = g.Key.ToString("dd/MM"),
                        Value = g.Count()
                    })
                    .OrderBy(i => i.Label)
                    .ToList();

                // 4. Application Trends (last 14 days)
                var fourteenDaysAgo = DateTime.UtcNow.AddDays(-14).Date;
                var appsLast14Days = await _context.Applications
                    .Where(a => a.AppliedAt >= fourteenDaysAgo)
                    .Select(a => new { a.AppliedAt })
                    .ToListAsync();

                var appTrends = appsLast14Days
                    .GroupBy(a => a.AppliedAt.Date)
                    .Select(g => new DashboardChartItemDto
                    {
                        Label = g.Key.ToString("dd/MM"),
                        Value = g.Count()
                    })
                    .OrderBy(i => i.Label)
                    .ToList();

                // 5. User Roles distribution
                var userRoles = await _context.Users
                    .GroupBy(u => u.Role)
                    .Select(g => new DashboardChartItemDto
                    {
                        Label = g.Key,
                        Value = g.Count()
                    }).ToListAsync();

                // 6. Top Job Categories
                var topCategories = await _context.Jobs
                    .Where(j => j.CategoryId != null)
                    .GroupBy(j => j.CategoryId)
                    .Select(g => new { CategoryId = g.Key, Count = g.Count() })
                    .OrderByDescending(x => x.Count)
                    .Take(5)
                    .ToListAsync();

                var categoryIds = topCategories.Select(tc => tc.CategoryId).ToList();
                var categories = await _context.JobCategories
                    .Where(c => categoryIds.Contains(c.CategoryId))
                    .ToListAsync();

                var topCatDtos = topCategories.Select(tc => new DashboardChartItemDto
                {
                    Label = categories.FirstOrDefault(c => c.CategoryId == tc.CategoryId)?.Name ?? "Khác",
                    Value = tc.Count
                }).ToList();

                var stats = new AdminDashboardStatsDto
                {
                    TotalUsers = totalUsers,
                    TotalJobs = totalJobs,
                    ActiveJobs = activeJobs,
                    TotalApplications = totalApplications,
                    RecentActivities = allActivities,
                    ApplicationsByStatus = appsByStatus,
                    MonthlyRegistrations = dailyRegs,
                    ApplicationTrends = appTrends,
                    UserRolesDistribution = userRoles,
                    TopJobCategories = topCatDtos
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi hệ thống khi lấy thống kê", Error = ex.Message });
            }
        }
        [HttpGet("health")]
        public async Task<IActionResult> GetHealth()
        {
            try
            {
                var services = new List<ServiceStatusDto>();

                // 1. Database Check
                var dbStatus = "Online";
                var dbPerf = "N/A";
                try
                {
                    var sw = System.Diagnostics.Stopwatch.StartNew();
                    await _context.Database.CanConnectAsync();
                    sw.Stop();
                    dbPerf = $"{sw.ElapsedMilliseconds}ms";
                }
                catch
                {
                    dbStatus = "Offline";
                }
                services.Add(new ServiceStatusDto { Name = "Database Node", Status = dbStatus, Performance = dbPerf });

                // 2. Images Service Check
                var imgStatus = "Online";
                var imgPerf = "N/A";
                try
                {
                    using var client = new HttpClient();
                    var sw = System.Diagnostics.Stopwatch.StartNew();
                    var response = await client.GetAsync("http://localhost:8000/docs");
                    sw.Stop();
                    if (!response.IsSuccessStatusCode) imgStatus = "Warning";
                    imgPerf = $"{sw.ElapsedMilliseconds}ms";
                }
                catch
                {
                    imgStatus = "Offline";
                }
                services.Add(new ServiceStatusDto { Name = "Image Service", Status = imgStatus, Performance = imgPerf });

                // 3. API Gateway (Self)
                services.Add(new ServiceStatusDto { Name = "API Gateway", Status = "Online", Performance = "Stable" });

                // 4. Memory Usage
                var process = System.Diagnostics.Process.GetCurrentProcess();
                var memoryUsed = process.WorkingSet64 / (1024 * 1024); // MB
                var totalMemory = 1024; // Assume 1GB for percentage calculation or get from system
                var memPercent = Math.Min(100, (double)memoryUsed / totalMemory * 100);

                var health = new SystemHealthDto
                {
                    Status = services.All(s => s.Status == "Online") ? "Stable" : "Warning",
                    Services = services,
                    Resources = new ResourceUsageDto
                    {
                        MemoryPercentage = Math.Round(memPercent, 1),
                        PeakLoad = "N/A"
                    }
                };

                return Ok(health);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi kiểm tra sức khỏe hệ thống", Error = ex.Message });
            }
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
        {
            try
            {
                var query = _context.Users
                    .Where(u => u.Role != "Admin");

                var totalCount = await query.CountAsync();
                
                var users = await query
                    .OrderByDescending(u => u.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(u => new AdminUserDto
                    {
                        UserId = u.UserId,
                        UserName = u.UserName,
                        Email = u.Email,
                        IsActive = u.IsActive,
                        CreatedAt = u.CreatedAt
                    }).ToListAsync();

                return Ok(new
                {
                    Items = users,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi lấy danh sách người dùng", Error = ex.Message });
            }
        }

        [HttpGet("users/{id}/details")]
        public async Task<IActionResult> GetUserDetails(Guid id)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
                if (user == null) return NotFound(new { Message = "Không tìm thấy người dùng" });

                var imageServiceUrl = _configuration["ImagesService:Url"]?.TrimEnd('/') ?? "http://127.0.0.1:8000";

                var detail = new AdminUserDetailDto
                {
                    UserId = user.UserId,
                    UserName = user.UserName,
                    Email = user.Email,
                    IsActive = user.IsActive,
                    Role = user.Role,
                    CreatedAt = user.CreatedAt
                };

                // Load Profile
                if (user.Role == "Employer")
                {
                    var empProfile = await _context.EmployerProfiles
                        .Include(p => p.EmployerCompanies)
                        .ThenInclude(ec => ec.Company)
                        .FirstOrDefaultAsync(p => p.UserId == id);
                    
                    if (empProfile != null)
                    {
                        var profileImg = await _context.EmployerProfileImages
                            .Where(i => i.EmployerId == empProfile.EmployerId && i.IsPrimary == true && i.IsActive == true)
                            .FirstOrDefaultAsync();

                        if (profileImg != null)
                        {
                            detail.AvatarUrl = $"{imageServiceUrl}{profileImg.FilePath}";
                        }

                        detail.Profile = new AdminUserProfileInfoDto
                        {
                            FullName = empProfile.DisplayName,
                            Phone = empProfile.ContactPhone,
                            Industry = empProfile.Industry,
                            Bio = empProfile.Bio,
                            LinkedInProfile = empProfile.LinkedInProfile,
                            Website = empProfile.Website,
                            YearsOfExperience = empProfile.YearsOfExperience,
                            Position = empProfile.Position,
                            Companies = empProfile.EmployerCompanies.Select(ec => new AdminUserCompanyDto
                            {
                                CompanyId = ec.CompanyId,
                                Name = ec.Company?.Name,
                                Website = ec.Company?.Website,
                                LogoUrl = ec.Company != null ? $"{imageServiceUrl}{ec.Company.LogoURL}" : null,
                                Industry = ec.Company?.Industry,
                                CompanySize = ec.Company?.CompanySize,
                                Address = ec.Company?.Address,
                                IsPrimary = ec.IsPrimary ?? false
                            }).ToList()
                        };
                    }
                }
                else
                {
                    var candProfile = await _context.CandidateProfiles.FirstOrDefaultAsync(p => p.UserId == id);
                    if (candProfile != null)
                    {
                        var profileImg = await _context.CandidateProfileImages
                            .Where(i => i.CandidateId == candProfile.CandidateId && i.IsPrimary == true && i.IsActive == true)
                            .FirstOrDefaultAsync();

                        if (profileImg != null)
                        {
                            detail.AvatarUrl = $"{imageServiceUrl}{profileImg.FilePath}";
                        }

                        var portfolioImgs = await _context.CandidateProfileImages
                            .Where(i => i.CandidateId == candProfile.CandidateId && i.IsPrimary == false && i.IsActive == true)
                            .Select(i => $"{imageServiceUrl}{i.FilePath}")
                            .ToListAsync();

                        detail.Profile = new AdminUserProfileInfoDto
                        {
                            FullName = candProfile.FullName,
                            Phone = candProfile.Phone,
                            Address = candProfile.Address,
                            Bio = candProfile.Bio,
                            Gender = candProfile.Gender,
                            DateOfBirth = candProfile.DateOfBirth,
                            Headline = candProfile.Headline,
                            Skills = candProfile.Skills,
                            EducationLevel = candProfile.EducationLevel,
                            ExperienceYears = candProfile.ExperienceYears,
                            LinkedInProfile = candProfile.LinkedInProfile,
                            PortfolioURL = candProfile.PortfolioURL,
                            PortfolioImages = portfolioImgs
                        };

                        // Load Applications (only for candidates)
                        detail.Applications = await _context.Applications
                            .Where(a => a.CandidateId == candProfile.CandidateId)
                            .OrderByDescending(a => a.AppliedAt)
                            .Select(a => new AdminUserApplicationDto
                            {
                                ApplicationId = a.ApplicationId,
                                AppliedAt = a.AppliedAt,
                                Status = a.Status,
                                IsViewedByEmployer = a.IsViewedByEmployer,
                                JobGuid = _context.Jobs.Where(j => j.JobId == a.JobId).Select(j => j.JobGuid).FirstOrDefault(),
                                JobTitle = _context.Jobs.Where(j => j.JobId == a.JobId).Select(j => j.Title).FirstOrDefault(),
                                CompanyName = _context.Jobs.Where(j => j.JobId == a.JobId).Include(j => j.Company).Select(j => j.Company != null ? j.Company.Name : "N/A").FirstOrDefault()
                            })
                            .ToListAsync();
                    }
                }

                // Load Blogs
                detail.Blogs = await _context.Blogs
                    .Include(b => b.Images)
                    .Where(b => b.AuthorUserId == id)
                    .OrderByDescending(b => b.CreatedAt)
                    .Select(b => new AdminUserBlogDto
                    {
                        BlogId = b.BlogId,
                        Title = b.Title,
                        IsPublished = b.IsPublished,
                        CreatedAt = b.CreatedAt,
                        ImageUrl = b.Images.Where(i => i.IsPrimary == true).Select(i => $"{imageServiceUrl}{i.FilePath}").FirstOrDefault()
                    }).ToListAsync();

                // Load Jobs
                detail.Jobs = await _context.Jobs
                    .Include(j => j.Company)
                    .Where(j => j.PostedByUserId == id)
                    .OrderByDescending(j => j.CreatedAt)
                    .Select(j => new AdminUserJobDto
                    {
                        JobId = j.JobId,
                        JobGuid = j.JobGuid,
                        Title = j.Title,
                        IsActive = j.IsActive,
                        CreatedAt = j.CreatedAt,
                        CompanyLogoUrl = j.Company != null ? $"{imageServiceUrl}{j.Company.LogoURL}" : null,
                        HiringStatus = j.HiringStatus,
                        SalaryFrom = j.SalaryFrom,
                        SalaryTo = j.SalaryTo,
                        DeadlineDate = j.DeadlineDate
                    }).ToListAsync();

                return Ok(detail);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi lấy chi tiết người dùng", Error = ex.Message });
            }
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UpdateRoleDto dto)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
                if (user == null) return NotFound(new { Message = "Không tìm thấy người dùng" });

                user.Role = dto.Role;
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Cập nhật vai trò thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi cập nhật vai trò", Error = ex.Message });
            }
        }

        [HttpPut("users/{id}/status")]
        public async Task<IActionResult> UpdateUserStatus(Guid id, [FromServices] Microsoft.AspNetCore.SignalR.IHubContext<Server.Hubs.JobsHub> hubContext)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
                if (user == null) return NotFound(new { Message = "Không tìm thấy người dùng" });

                user.IsActive = !user.IsActive;
                await _context.SaveChangesAsync();

                // Notify user via SignalR
                var userGroup = $"user_{id.ToString("D").ToLower()}";
                if (!user.IsActive)
                {
                    await hubContext.Clients.Group(userGroup).SendAsync("userbanned", "Tài khoản của bạn đã bị khóa bởi quản trị viên.");
                }
                else
                {
                    await hubContext.Clients.Group(userGroup).SendAsync("useractivated", "Tài khoản của bạn đã được kích hoạt lại.");
                }

                return Ok(new { Message = $"Đã {(user.IsActive ? "kích hoạt" : "khóa")} tài khoản thành công", IsActive = user.IsActive });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi cập nhật trạng thái", Error = ex.Message });
            }
        }
        [HttpGet("jobs")]
        public async Task<IActionResult> GetJobs([FromQuery] int page = 1, [FromQuery] int pageSize = 25, [FromQuery] string? search = null)
        {
            try
            {
                _logger.LogInformation("Admin fetching jobs: Page {Page}, PageSize {PageSize}, Search '{Search}'", page, pageSize, search);

                var baseQuery = _context.Jobs.Include(j => j.Company).AsNoTracking();

                if (!string.IsNullOrWhiteSpace(search))
                {
                    var searchLower = search.ToLower();
                    baseQuery = baseQuery.Where(j => j.Title.ToLower().Contains(searchLower) || (j.Company != null && j.Company.Name.ToLower().Contains(searchLower)));
                }

                var totalCount = await baseQuery.CountAsync();
                _logger.LogInformation("Total jobs found in DB: {Count}", totalCount);

                var rawJobs = await baseQuery
                    .OrderByDescending(j => j.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // Fetch Category names separately to avoid ORA-12704 character set mismatch in complex joins
                var categoryIds = rawJobs.Select(j => j.CategoryId).Where(id => id.HasValue).Select(id => id!.Value).Distinct().ToList();
                var categories = await _context.JobCategories
                    .Where(c => categoryIds.Contains(c.CategoryId))
                    .ToDictionaryAsync(c => c.CategoryId, c => c.Name);

                // Fetch User emails separately
                var userIds = rawJobs.Select(j => j.PostedByUserId).Distinct().ToList();
                var userEmails = await _context.Users
                    .Where(u => userIds.Contains(u.UserId))
                    .ToDictionaryAsync(u => u.UserId, u => u.Email);

                var imageServiceUrl = _configuration["ImagesService:Url"]?.TrimEnd('/') ?? "http://127.0.0.1:8000";

                var jobs = rawJobs.Select(j => new AdminJobDto
                {
                    JobId = j.JobId,
                    JobGuid = j.JobGuid,
                    Title = j.Title,
                    CompanyName = j.Company?.Name ?? "N/A",
                    CompanyLogoUrl = !string.IsNullOrEmpty(j.Company?.LogoURL) ? $"/images{j.Company.LogoURL}" : null,
                    CategoryName = j.CategoryId.HasValue && categories.TryGetValue(j.CategoryId.Value, out var catName) ? catName : "N/A",
                    PostedByEmail = userEmails.TryGetValue(j.PostedByUserId, out var email) ? email : "N/A",
                    IsActive = j.IsActive,
                    CreatedAt = j.CreatedAt,
                    HiringStatus = j.HiringStatus,
                    SalaryFrom = j.SalaryFrom,
                    SalaryTo = j.SalaryTo,
                    DeadlineDate = j.DeadlineDate
                }).ToList();

                _logger.LogInformation("Returning {Count} jobs for admin page {Page}", jobs.Count, page);

                return Ok(new
                {
                    items = jobs,
                    totalCount = totalCount,
                    page = page,
                    pageSize = pageSize
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AdminController.GetJobs");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách bài đăng", error = ex.Message });
            }
        }

        [HttpGet("jobs/{id}")]
        public async Task<IActionResult> GetJobDetails(Guid id)
        {
            try
            {
                var job = await _context.Jobs
                    .Include(j => j.Company)
                    .FirstOrDefaultAsync(j => j.JobId == id);

                if (job == null) return NotFound(new { message = "Không tìm thấy bài đăng" });

                var imageServiceUrl = _configuration["ImagesService:Url"]?.TrimEnd('/') ?? "http://127.0.0.1:8000";
                
                // Helper to construct logo URL - using /images prefix to leverage frontend proxy
                string? GetLogoUrl(string? rawPath) => !string.IsNullOrEmpty(rawPath) ? $"/images{rawPath}" : null;

                var category = await _context.JobCategories.FirstOrDefaultAsync(c => c.CategoryId == job.CategoryId);
                var poster = await _context.Users.FirstOrDefaultAsync(u => u.UserId == job.PostedByUserId);

                var detail = new AdminJobDetailDto
                {
                    JobId = job.JobId,
                    JobGuid = job.JobGuid,
                    Title = job.Title,
                    Description = job.Description,
                    EmploymentType = job.EmploymentType,
                    SalaryFrom = job.SalaryFrom,
                    SalaryTo = job.SalaryTo,
                    IsActive = job.IsActive,
                    CreatedAt = job.CreatedAt,
                    HiringStatus = job.HiringStatus,
                    PositionsNeeded = job.PositionsNeeded,
                    PositionsFilled = job.PositionsFilled,
                    DeadlineDate = job.DeadlineDate,
                    MinAge = job.MinAge,
                    MaxAge = job.MaxAge,
                    RequiredExperienceYears = job.RequiredExperienceYears,
                    RequiredDegree = job.RequiredDegree,
                    GenderPreference = job.GenderPreference,
                    SkillsRequired = job.SkillsRequired,
                    CategoryName = category?.Name ?? "N/A",
                    PostedByEmail = poster?.Email ?? "N/A",
                    Company = job.Company != null ? new AdminJobCompanyDto
                    {
                        CompanyId = job.Company.CompanyId,
                        Name = job.Company.Name,
                        LogoUrl = GetLogoUrl(job.Company.LogoURL),
                        Website = job.Company.Website,
                        Industry = job.Company.Industry,
                        CompanySize = job.Company.CompanySize
                    } : null
                };

                // Load Applications
                detail.Applications = await _context.Applications
                    .Where(a => a.JobId == job.JobId)
                    .OrderByDescending(a => a.AppliedAt)
                    .Select(a => new AdminJobApplicationDto
                    {
                        ApplicationId = a.ApplicationId,
                        CandidateId = a.CandidateId,
                        CandidateName = _context.CandidateProfiles.Where(cp => cp.CandidateId == a.CandidateId).Select(cp => cp.FullName).FirstOrDefault(),
                        CandidateEmail = _context.Users.Where(u => u.UserId == _context.CandidateProfiles.Where(cp => cp.CandidateId == a.CandidateId).Select(cp => cp.UserId).FirstOrDefault()).Select(u => u.Email).FirstOrDefault(),
                        Status = a.Status,
                        AppliedAt = a.AppliedAt,
                        IsViewedByEmployer = a.IsViewedByEmployer
                    }).ToListAsync();

                return Ok(detail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching job details for {JobId}", id);
                return StatusCode(500, new { message = "Lỗi khi lấy chi tiết bài đăng", error = ex.Message });
            }
        }

        [HttpPatch("jobs/{id}/status")]
        public async Task<IActionResult> ToggleJobStatus(Guid id)
        {
            try
            {
                var job = await _context.Jobs.FirstOrDefaultAsync(j => j.JobId == id);
                if (job == null) return NotFound(new { Message = "Không tìm thấy bài đăng" });

                job.IsActive = job.IsActive == 1 ? 0 : 1;
                await _context.SaveChangesAsync();

                return Ok(new { Message = $"Đã {(job.IsActive == 1 ? "hiển thị" : "ẩn")} bài đăng thành công", IsActive = job.IsActive });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi cập nhật trạng thái bài đăng", Error = ex.Message });
            }
        }

        [HttpDelete("jobs/{id}")]
        public async Task<IActionResult> DeleteJob(Guid id)
        {
            try
            {
                var job = await _context.Jobs.FirstOrDefaultAsync(j => j.JobId == id);
                if (job == null) return NotFound(new { Message = "Không tìm thấy bài đăng" });

                // Delete associated images first if any
                var images = await _context.JobImages.Where(i => i.JobId == id).ToListAsync();
                if (images.Any())
                {
                    _context.JobImages.RemoveRange(images);
                }

                // Delete associated applications
                var apps = await _context.Applications.Where(a => a.JobId == id).ToListAsync();
                if (apps.Any())
                {
                    _context.Applications.RemoveRange(apps);
                }

                _context.Jobs.Remove(job);
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Xóa bài đăng thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi xóa bài đăng", Error = ex.Message });
            }
        }
    }

    public class UpdateRoleDto
    {
        public string Role { get; set; } = string.Empty;
    }
}
