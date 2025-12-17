using Server.Models;

namespace Server.Data.Notifications
{
    public interface IMessageRepository
    {
        Task<List<Message>> GetMessagesByUserIdAsync(Guid userId, int limit = 50);
        Task<List<Message>> GetConversationAsync(Guid userId1, Guid userId2, int limit = 50);
        Task<int> GetUnreadCountByUserIdAsync(Guid userId);
        Task CreateMessageAsync(Message message);
        Task MarkAsReadAsync(Guid messageId);
        Task MarkConversationAsReadAsync(Guid receiverUserId, Guid senderUserId);
    }
}
