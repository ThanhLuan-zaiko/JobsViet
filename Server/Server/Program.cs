using Serilog;
using Server.Extensions;
using StackExchange.Redis;
using Server.Middleware;
using Server.Middleware.Auth;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
builder.Host.UseSerilog((ctx, lc) => lc
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day));

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddCustomRateLimiting();
builder.Services.AddCustomAntiforgery();
builder.Services.AddCustomRedis(builder.Configuration);
builder.Services.AddCustomSession();
builder.Services.AddCustomDbContexts(builder.Configuration);
builder.Services.AddCustomUnitOfWorkAndRepositories();
builder.Services.AddCustomServices();
builder.Services.AddCustomAutoMapper();
builder.Services.AddCustomFluentValidation();
builder.Services.AddCustomCaching();
builder.Services.AddCustomApiVersioning();
builder.Services.AddCustomSwagger();
builder.Services.AddCustomHealthChecks();
builder.Services.AddCustomCors(builder.Configuration);
builder.Services.AddCustomAuthentication();

var app = builder.Build();

// Test Redis connection on startup
try
{
    var redis = app.Services.GetRequiredService<IConnectionMultiplexer>();
    var db = redis.GetDatabase();
    var pong = db.Ping();
    Console.WriteLine($"Redis connected successfully (Ping: {pong.TotalMilliseconds} ms)");
}
catch (Exception ex)
{
    Console.WriteLine($"Redis connection failed: {ex.Message}");
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Add Routing
app.UseRouting();

// Add Serilog Request Logging
app.UseSerilogRequestLogging();

// Add Global Exception Middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

// Add CORS
app.UseCors();

// Add Session
app.UseSession();

// Add Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Add Rate Limiting
app.UseRateLimiter();

// Add custom middleware
app.UseMiddleware<RateLimitMiddleware>();
app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseMiddleware<DomainBlockingMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<AuthLoggingMiddleware>();

// Map Health Checks
app.MapHealthChecks("/health");

app.MapControllers().RequireRateLimiting("Fixed");

// Map SignalR hub
app.MapHub<Server.Hubs.JobsHub>("/jobsHub");

app.Run();
