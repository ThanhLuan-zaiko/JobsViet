using Server.Data.Notifications;
using Server.Data.Jobs;
using Server.Models;

namespace Server.Services.Notifications
{
    public interface INotificationService
    {
        Task<List<NotificationDto>> GetUserNotificationsAsync(Guid userId, int limit = 20);
        Task<int> GetUnreadCountAsync(Guid userId);
        Task CreateNotificationAsync(Guid userId, string type, string title, string message, Guid? jobId = null, Guid? applicationId = null);
        Task MarkAsReadAsync(Guid notificationId);
        Task MarkAllAsReadAsync(Guid userId);
    }

    public class NotificationDto
    {
        public Guid NotificationId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public Guid? RelatedJobId { get; set; }
        public Guid? RelatedApplicationId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IUnitOfWork _unitOfWork;

        public NotificationService(INotificationRepository notificationRepository, IUnitOfWork unitOfWork)
        {
            _notificationRepository = notificationRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<NotificationDto>> GetUserNotificationsAsync(Guid userId, int limit = 20)
        {
            var notifications = await _notificationRepository.GetNotificationsByUserIdAsync(userId, limit);
            return notifications.Select(n => new NotificationDto
            {
                NotificationId = n.NotificationId,
                Type = n.Type,
                Title = n.Title,
                Message = n.Message,
                IsRead = n.IsRead == 1,
                RelatedJobId = n.RelatedJobId,
                RelatedApplicationId = n.RelatedApplicationId,
                CreatedAt = n.CreatedAt
            }).ToList();
        }

        public async Task<int> GetUnreadCountAsync(Guid userId)
        {
            return await _notificationRepository.GetUnreadCountByUserIdAsync(userId);
        }

        public async Task CreateNotificationAsync(Guid userId, string type, string title, string message, Guid? jobId = null, Guid? applicationId = null)
        {
            var notification = new Notification
            {
                UserId = userId,
                Type = type,
                Title = title,
                Message = message,
                RelatedJobId = jobId,
                RelatedApplicationId = applicationId,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationRepository.CreateNotificationAsync(notification);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task MarkAsReadAsync(Guid notificationId)
        {
            await _notificationRepository.MarkAsReadAsync(notificationId);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task MarkAllAsReadAsync(Guid userId)
        {
            await _notificationRepository.MarkAllAsReadByUserIdAsync(userId);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}

