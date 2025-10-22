using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Threading.Tasks;

namespace Server.Middleware
{
    public class DomainBlockingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<DomainBlockingMiddleware> _logger;
        private readonly string[] _allowedOrigins;

        public DomainBlockingMiddleware(RequestDelegate next, ILogger<DomainBlockingMiddleware> logger, IConfiguration configuration)
        {
            _next = next;
            _logger = logger;
            _allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? new string[0];
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var origin = context.Request.Headers["Origin"].ToString();
            var referer = context.Request.Headers["Referer"].ToString();

            // Check if origin is allowed
            if (!string.IsNullOrEmpty(origin) && !_allowedOrigins.Contains(origin))
            {
                _logger.LogWarning("Blocked request from invalid origin: {Origin}", origin);
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsync("Origin not allowed");
                return;
            }

            // Optional: Check referer as additional validation
            if (!string.IsNullOrEmpty(referer))
            {
                var refererOrigin = new Uri(referer).GetLeftPart(UriPartial.Authority);
                if (!_allowedOrigins.Contains(refererOrigin))
                {
                    _logger.LogWarning("Blocked request from invalid referer: {Referer}", referer);
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsync("Referer not allowed");
                    return;
                }
            }

            await _next(context);
        }
    }
}
