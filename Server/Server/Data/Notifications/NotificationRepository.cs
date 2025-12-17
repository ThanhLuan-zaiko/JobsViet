using Microsoft.EntityFrameworkCore;
using Server.Data.Jobs;
using Server.Models;

namespace Server.Data.Notifications
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly ApplicationDbContext _context;

        public NotificationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Notification>> GetNotificationsByUserIdAsync(Guid userId, int limit = 20)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<int> GetUnreadCountByUserIdAsync(Guid userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId && n.IsRead == 0)
                .CountAsync();
        }

        public async Task CreateNotificationAsync(Notification notification)
        {
            await _context.Notifications.AddAsync(notification);
        }

        public async Task MarkAsReadAsync(Guid notificationId)
        {
            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification != null)
            {
                notification.IsRead = 1;
            }
        }

        public async Task MarkAllAsReadByUserIdAsync(Guid userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && n.IsRead == 0)
                .ToListAsync();
            
            foreach (var notification in notifications)
            {
                notification.IsRead = 1;
            }
        }
    }
}
