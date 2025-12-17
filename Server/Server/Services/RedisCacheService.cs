using StackExchange.Redis;
using System.Text.Json;

namespace Server.Services
{
    public class RedisCacheService
    {
        private readonly IDatabase _db;

        public RedisCacheService(IConnectionMultiplexer redis)
        {
            _db = redis.GetDatabase();
        }

        public async Task SetCacheAsync<T>(string key, T data, TimeSpan? expiry = null)
        {
            var json = JsonSerializer.Serialize(data);
            await _db.StringSetAsync(key, json, expiry);
        }

        public async Task<T?> GetCacheAsync<T>(string key)
        {
            var value = await _db.StringGetAsync(key);
            if (value.IsNullOrEmpty) return default;
            return JsonSerializer.Deserialize<T>(value!);
        }

        public async Task RemoveCacheAsync(string key)
        {
            await _db.KeyDeleteAsync(key);
        }
    }
}
