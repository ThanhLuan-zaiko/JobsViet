namespace Server.Models
{
    public class Message
    {
        public Guid MessageId { get; set; } = Guid.NewGuid();
        public Guid SenderUserId { get; set; }
        public Guid ReceiverUserId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int IsRead { get; set; } = 0; // 0 = unread, 1 = read
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
