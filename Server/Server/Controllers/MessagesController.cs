using Microsoft.AspNetCore.Mvc;
using Server.Services.Notifications;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/v1.0/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly IMessageService _messageService;
        private readonly ILogger<MessagesController> _logger;

        public MessagesController(IMessageService messageService, ILogger<MessagesController> logger)
        {
            _messageService = messageService;
            _logger = logger;
        }

        /// <summary>
        /// Get all messages for the current user (both sent and received)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetUserMessages([FromQuery] int limit = 50)
        {
            var userId = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized("Bạn cần đăng nhập để xem tin nhắn");
            }

            var messages = await _messageService.GetUserMessagesAsync(userGuid, limit);
            return Ok(messages);
        }

        /// <summary>
        /// Get conversation with a specific user
        /// </summary>
        [HttpGet("conversation/{otherUserId}")]
        public async Task<IActionResult> GetConversation(Guid otherUserId, [FromQuery] int limit = 50)
        {
            var userId = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized("Bạn cần đăng nhập để xem tin nhắn");
            }

            var messages = await _messageService.GetConversationAsync(userGuid, otherUserId, limit);
            return Ok(messages);
        }

        /// <summary>
        /// Get unread message count for current user
        /// </summary>
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized("Bạn cần đăng nhập");
            }

            var count = await _messageService.GetUnreadCountAsync(userGuid);
            return Ok(new { unreadCount = count });
        }

        /// <summary>
        /// Send a message to another user
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            var userId = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized("Bạn cần đăng nhập để gửi tin nhắn");
            }

            if (request.ReceiverUserId == Guid.Empty)
            {
                return BadRequest("Người nhận không hợp lệ");
            }

            if (string.IsNullOrWhiteSpace(request.Subject) || string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest("Tiêu đề và nội dung không được để trống");
            }

            var message = await _messageService.SendMessageAsync(
                userGuid, 
                request.ReceiverUserId, 
                request.Subject, 
                request.Content
            );

            _logger.LogInformation("User {SenderId} sent message to {ReceiverId}", userGuid, request.ReceiverUserId);

            return Ok(message);
        }

        /// <summary>
        /// Mark a message as read
        /// </summary>
        [HttpPost("{messageId}/read")]
        public async Task<IActionResult> MarkAsRead(Guid messageId)
        {
            var userId = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized("Bạn cần đăng nhập");
            }

            await _messageService.MarkAsReadAsync(messageId);
            return Ok(new { success = true });
        }

        /// <summary>
        /// Mark all messages from a specific sender as read
        /// </summary>
        [HttpPost("conversation/{senderUserId}/read")]
        public async Task<IActionResult> MarkConversationAsRead(Guid senderUserId)
        {
            var userId = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized("Bạn cần đăng nhập");
            }

            await _messageService.MarkConversationAsReadAsync(userGuid, senderUserId);
            return Ok(new { success = true });
        }
    }

    public class SendMessageRequest
    {
        public Guid ReceiverUserId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }
}
