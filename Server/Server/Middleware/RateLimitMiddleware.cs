using Microsoft.AspNetCore.Http;
using StackExchange.Redis;

namespace Server.Middleware
{
    public class RateLimitMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IDatabase _db;

        public RateLimitMiddleware(RequestDelegate next, IConnectionMultiplexer redis)
        {
            _next = next;
            _db = redis.GetDatabase();
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var key = $"ratelimit:{ip}";
            var limit = 100; // 100 requests per minute
            var expire = TimeSpan.FromMinutes(1);

            var count = await _db.StringIncrementAsync(key);
            if (count == 1)
                await _db.KeyExpireAsync(key, expire);

            if (count > limit)
            {
                context.Response.StatusCode = 429;
                await context.Response.WriteAsync("Too many requests. Please try again later.");
                return;
            }

            await _next(context);
        }
    }
}
