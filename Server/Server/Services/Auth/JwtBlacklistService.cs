using StackExchange.Redis;

namespace Server.Services.Auth
{
    public class JwtBlacklistService
    {
        private readonly IDatabase _db;

        public JwtBlacklistService(IConnectionMultiplexer redis)
        {
            _db = redis.GetDatabase();
        }

        public async Task AddToBlacklistAsync(string token, TimeSpan expiry)
        {
            await _db.StringSetAsync($"blacklist:{token}", "1", expiry);
        }

        public async Task<bool> IsBlacklistedAsync(string token)
        {
            return await _db.KeyExistsAsync($"blacklist:{token}");
        }
    }
}
