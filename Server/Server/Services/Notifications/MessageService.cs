using Server.Data.Notifications;
using Server.Data.Jobs;
using Server.Models;

namespace Server.Services.Notifications
{
    public interface IMessageService
    {
        Task<List<MessageDto>> GetUserMessagesAsync(Guid userId, int limit = 50);
        Task<List<MessageDto>> GetConversationAsync(Guid userId, Guid otherUserId, int limit = 50);
        Task<int> GetUnreadCountAsync(Guid userId);
        Task<MessageDto> SendMessageAsync(Guid senderUserId, Guid receiverUserId, string subject, string content);
        Task MarkAsReadAsync(Guid messageId);
        Task MarkConversationAsReadAsync(Guid receiverUserId, Guid senderUserId);
    }

    public class MessageDto
    {
        public Guid MessageId { get; set; }
        public Guid SenderUserId { get; set; }
        public Guid ReceiverUserId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class MessageService : IMessageService
    {
        private readonly IMessageRepository _messageRepository;
        private readonly IUnitOfWork _unitOfWork;

        public MessageService(IMessageRepository messageRepository, IUnitOfWork unitOfWork)
        {
            _messageRepository = messageRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<MessageDto>> GetUserMessagesAsync(Guid userId, int limit = 50)
        {
            var messages = await _messageRepository.GetMessagesByUserIdAsync(userId, limit);
            return messages.Select(m => new MessageDto
            {
                MessageId = m.MessageId,
                SenderUserId = m.SenderUserId,
                ReceiverUserId = m.ReceiverUserId,
                Subject = m.Subject,
                Content = m.Content,
                IsRead = m.IsRead == 1,
                CreatedAt = m.CreatedAt
            }).ToList();
        }

        public async Task<List<MessageDto>> GetConversationAsync(Guid userId, Guid otherUserId, int limit = 50)
        {
            var messages = await _messageRepository.GetConversationAsync(userId, otherUserId, limit);
            return messages.Select(m => new MessageDto
            {
                MessageId = m.MessageId,
                SenderUserId = m.SenderUserId,
                ReceiverUserId = m.ReceiverUserId,
                Subject = m.Subject,
                Content = m.Content,
                IsRead = m.IsRead == 1,
                CreatedAt = m.CreatedAt
            }).ToList();
        }

        public async Task<int> GetUnreadCountAsync(Guid userId)
        {
            return await _messageRepository.GetUnreadCountByUserIdAsync(userId);
        }

        public async Task<MessageDto> SendMessageAsync(Guid senderUserId, Guid receiverUserId, string subject, string content)
        {
            var message = new Message
            {
                SenderUserId = senderUserId,
                ReceiverUserId = receiverUserId,
                Subject = subject,
                Content = content,
                CreatedAt = DateTime.UtcNow
            };

            await _messageRepository.CreateMessageAsync(message);
            await _unitOfWork.SaveChangesAsync();

            return new MessageDto
            {
                MessageId = message.MessageId,
                SenderUserId = message.SenderUserId,
                ReceiverUserId = message.ReceiverUserId,
                Subject = message.Subject,
                Content = message.Content,
                IsRead = false,
                CreatedAt = message.CreatedAt
            };
        }

        public async Task MarkAsReadAsync(Guid messageId)
        {
            await _messageRepository.MarkAsReadAsync(messageId);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task MarkConversationAsReadAsync(Guid receiverUserId, Guid senderUserId)
        {
            await _messageRepository.MarkConversationAsReadAsync(receiverUserId, senderUserId);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
