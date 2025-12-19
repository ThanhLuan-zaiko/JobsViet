using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
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
                    // Just a simple ping to the images service base URL
                    // Assume it's at http://localhost:8000 for now, or get from config
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
    }
}
