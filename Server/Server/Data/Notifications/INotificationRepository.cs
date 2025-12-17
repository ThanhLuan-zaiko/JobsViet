using Server.Models;

namespace Server.Data.Notifications
{
    public interface INotificationRepository
    {
        Task<List<Notification>> GetNotificationsByUserIdAsync(Guid userId, int limit = 20);
        Task<int> GetUnreadCountByUserIdAsync(Guid userId);
        Task CreateNotificationAsync(Notification notification);
        Task MarkAsReadAsync(Guid notificationId);
        Task MarkAllAsReadByUserIdAsync(Guid userId);
    }
}
