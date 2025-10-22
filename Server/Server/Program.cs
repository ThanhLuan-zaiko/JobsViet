using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using Server.Auth;
using Server.Data.Auth;
using Server.Data.Jobs;
using Server.Middleware;
using Server.Middleware.Auth;
using Server.Services;
using Server.Services.Auth;
using Server.Services.Jobs;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
builder.Host.UseSerilog((ctx, lc) => lc
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day));

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Add Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("Fixed", opt =>
    {
        opt.PermitLimit = 100; // 100 requests
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
        opt.Window = TimeSpan.FromMinutes(1);
    });
});

// Add Antiforgery
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN";
    options.Cookie.Name = "XSRF-TOKEN";
    options.Cookie.HttpOnly = false; // Allow client to read token
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.SuppressXFrameOptionsHeader = false;
});

string? redisConnectionString = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";

// Redis configuration
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    ConfigurationOptions config = ConfigurationOptions.Parse(redisConnectionString, true);
    config.AbortOnConnectFail = false;
    config.ConnectRetry = 3;
    config.ConnectTimeout = 2000;
    config.SyncTimeout = 2000;
    config.KeepAlive = 180;
    return ConnectionMultiplexer.Connect(config);
});

// Redis Cache mặc định
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
});

// Register Redis services
builder.Services.AddSingleton<RedisCacheService>();
builder.Services.AddSingleton<JwtBlacklistService>();

builder.Services.AddSession(options =>
{
    options.Cookie.Name = ".JobViet.Session";
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.None; // Change to Always in production with HTTPS
    options.Cookie.SameSite = SameSiteMode.Lax; // Changed from Strict to Lax for better compatibility
});

// Add EF Core
builder.Services.AddDbContext<Server.Data.Jobs.ApplicationDbContext>(options =>
    options.UseOracle(builder.Configuration.GetConnectionString("OracleDb")));

// Add Auth EF Core
builder.Services.AddDbContext<Server.Data.Auth.ApplicationDbContext>(options =>
    options.UseOracle(builder.Configuration.GetConnectionString("OracleDb")));

// Register Unit of Work and Repositories
builder.Services.AddScoped<Server.Data.Jobs.IUnitOfWork, Server.Data.Jobs.UnitOfWork>();
builder.Services.AddScoped<IJobRepository, JobRepository>();

// Register Auth Unit of Work
builder.Services.AddScoped<Server.Data.Auth.IUnitOfWork, Server.Data.Auth.UnitOfWork>();

// Register Services
builder.Services.AddScoped<IJobService, JobService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Add JWT Service
builder.Services.AddScoped<JwtService>();

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Add Caching
builder.Services.AddMemoryCache();

// Add API Versioning
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
});

// Add Swagger with JWT
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "JobsViet API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter JWT with Bearer into field",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Add Health Checks
builder.Services.AddHealthChecks();

// Add CORS from config
builder.Services.AddCors(options =>
{
    var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins ?? new string[] { })
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Add Cookie Authentication for sessions
builder.Services.AddAuthentication("Cookies")
    .AddCookie("Cookies", options =>
    {
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = CookieSecurePolicy.None; // Match session cookie settings
        options.Cookie.SameSite = SameSiteMode.Lax; // Match session cookie settings
        options.LoginPath = "/auth/login";
        options.LogoutPath = "/auth/logout";
    });

var app = builder.Build();

// Test Redis connection on startup
try
{
    var redis = app.Services.GetRequiredService<IConnectionMultiplexer>();
    var db = redis.GetDatabase();
    var pong = db.Ping();
    Console.WriteLine($"✅ Redis connected successfully (Ping: {pong.TotalMilliseconds} ms)");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Redis connection failed: {ex.Message}");
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

// Add Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Add Session
app.UseSession();

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

app.Run();
