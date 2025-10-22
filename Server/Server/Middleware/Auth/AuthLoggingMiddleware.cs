using Microsoft.AspNetCore.Http;
using Serilog;
using System.Threading.Tasks;

namespace Server.Middleware.Auth
{
    public class AuthLoggingMiddleware
    {
        private readonly RequestDelegate _next;

        public AuthLoggingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.Request.Path.StartsWithSegments("/api/v1.0/auth") && context.Request.Path.Value != null)
            {
                // Log auth requests
                Log.Information("Auth request: {Method} {Path} from {IP}",
                    context.Request.Method,
                    context.Request.Path,
                    context.Connection.RemoteIpAddress?.ToString() ?? "unknown");
            }

            await _next(context);

            // Log auth responses after processing
            if (context.Request.Path.StartsWithSegments("/api/v1.0/auth") && context.Request.Path.Value != null)
            {
                if (context.Request.Method == "POST" && context.Request.Path.Value.Contains("login"))
                {
                    Log.Warning("Login attempt: {Method} {Path} from {IP} - Status: {Status}",
                        context.Request.Method,
                        context.Request.Path,
                        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        context.Response.StatusCode);
                }
            }
        }
    }
}
