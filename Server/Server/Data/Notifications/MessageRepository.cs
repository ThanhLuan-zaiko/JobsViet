using Microsoft.EntityFrameworkCore;
using Server.Data.Jobs;
using Server.Models;

namespace Server.Data.Notifications
{
    public class MessageRepository : IMessageRepository
    {
        private readonly ApplicationDbContext _context;

        public MessageRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Message>> GetMessagesByUserIdAsync(Guid userId, int limit = 50)
        {
            return await _context.Messages
                .Where(m => m.ReceiverUserId == userId || m.SenderUserId == userId)
                .OrderByDescending(m => m.CreatedAt)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<List<Message>> GetConversationAsync(Guid userId1, Guid userId2, int limit = 50)
        {
            return await _context.Messages
                .Where(m => (m.SenderUserId == userId1 && m.ReceiverUserId == userId2) ||
                           (m.SenderUserId == userId2 && m.ReceiverUserId == userId1))
                .OrderBy(m => m.CreatedAt)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<int> GetUnreadCountByUserIdAsync(Guid userId)
        {
            return await _context.Messages
                .Where(m => m.ReceiverUserId == userId && m.IsRead == 0)
                .CountAsync();
        }

        public async Task CreateMessageAsync(Message message)
        {
            await _context.Messages.AddAsync(message);
        }

        public async Task MarkAsReadAsync(Guid messageId)
        {
            var message = await _context.Messages.FindAsync(messageId);
            if (message != null)
            {
                message.IsRead = 1;
            }
        }

        public async Task MarkConversationAsReadAsync(Guid receiverUserId, Guid senderUserId)
        {
            var messages = await _context.Messages
                .Where(m => m.ReceiverUserId == receiverUserId && m.SenderUserId == senderUserId && m.IsRead == 0)
                .ToListAsync();
            
            foreach (var message in messages)
            {
                message.IsRead = 1;
            }
        }
    }
}
