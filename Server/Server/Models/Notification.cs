namespace Server.Models
{
    public class Notification
    {
        public Guid NotificationId { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public string Type { get; set; } = string.Empty; // JobUpdate, ApplicationStatus, NewApplication, etc.
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public int IsRead { get; set; } = 0; // 0 = unread, 1 = read
        public Guid? RelatedJobId { get; set; }
        public Guid? RelatedApplicationId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
