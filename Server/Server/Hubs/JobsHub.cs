using Microsoft.AspNetCore.SignalR;

namespace Server.Hubs
{
    public class JobsHub : Hub
    {
        private readonly ILogger<JobsHub> _logger;

        public JobsHub(ILogger<JobsHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            if (httpContext != null)
            {
                await httpContext.Session.LoadAsync();
                var userIdStr = httpContext.Session.GetString("UserId");
                var userRole = httpContext.Session.GetString("UserRole");
                
                if (!string.IsNullOrEmpty(userIdStr))
                {
                    // Add user to their personal group for targeted notifications
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userIdStr.ToLower()}");
                    _logger.LogInformation("User {UserId} connected to SignalR with connection {ConnectionId}", userIdStr, Context.ConnectionId);
                    
                    // Add to role-specific group
                    if (!string.IsNullOrEmpty(userRole))
                    {
                        await Groups.AddToGroupAsync(Context.ConnectionId, $"role_{userRole.ToLower()}");
                        _logger.LogInformation("User {UserId} added to role group {Role}", userIdStr, userRole);
                    }
                }
            }
            
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var httpContext = Context.GetHttpContext();
            if (httpContext != null)
            {
                await httpContext.Session.LoadAsync();
                var userIdStr = httpContext.Session.GetString("UserId");
                var userRole = httpContext.Session.GetString("UserRole");
                
                if (!string.IsNullOrEmpty(userIdStr))
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userIdStr.ToLower()}");
                    _logger.LogInformation("User {UserId} disconnected from SignalR", userIdStr);
                    
                    if (!string.IsNullOrEmpty(userRole))
                    {
                        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"role_{userRole.ToLower()}");
                    }
                }
            }
            
            await base.OnDisconnectedAsync(exception);
        }

        // Client can call this to join a specific user group after authentication
        public async Task JoinUserGroup(string userId)
        {
            if (string.IsNullOrEmpty(userId)) return;
            
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId.ToLower()}");
            _logger.LogInformation("Connection {ConnectionId} joined user group {UserId}", Context.ConnectionId, userId.ToLower());
        }

        // Client can call this to leave a user group
        public async Task LeaveUserGroup(string userId)
        {
            if (string.IsNullOrEmpty(userId)) return;
            
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId.ToLower()}");
            _logger.LogInformation("Connection {ConnectionId} left user group {UserId}", Context.ConnectionId, userId.ToLower());
        }
    }
}
