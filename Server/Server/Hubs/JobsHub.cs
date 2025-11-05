using Microsoft.AspNetCore.SignalR;

namespace Server.Hubs
{
    public class JobsHub : Hub
    {
        // This hub will handle real-time job updates
        // Clients can connect to this hub to receive job-related notifications
    }
}
