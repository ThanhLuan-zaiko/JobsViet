using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc.Versioning;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Server.Auth;
using Server.Data.Auth;
using Server.Data.Jobs;
using Server.Middleware;
using Server.Services;
using Server.Services.Auth;
using Server.Services.Jobs;
using Server.Services.Blogs;
using Server.Services.Profiles;
using Server.Validators.Auth;
using StackExchange.Redis;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Http;
using Server.Data.Notifications;
using Server.Services.Notifications;

namespace Server.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddCustomRateLimiting(this IServiceCollection services)
        {
            services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
                options.AddPolicy("Fixed", context =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        factory: partition => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 100,
                            Window = TimeSpan.FromMinutes(1),
                            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                            QueueLimit = 0
                        }));
            });
            return services;
        }

        public static IServiceCollection AddCustomAntiforgery(this IServiceCollection services)
        {
            services.AddAntiforgery(options =>
            {
                options.HeaderName = "X-CSRF-TOKEN";
                options.Cookie.Name = "XSRF-TOKEN";
                options.Cookie.HttpOnly = false; // Allow client to read token
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.SuppressXFrameOptionsHeader = false;
            });
            return services;
        }

        public static IServiceCollection AddCustomRedis(this IServiceCollection services, IConfiguration configuration)
        {
            string? redisConnectionString = configuration.GetConnectionString("Redis") ?? "localhost:6379";

            services.AddSingleton<IConnectionMultiplexer>(sp =>
            {
                ConfigurationOptions config = ConfigurationOptions.Parse(redisConnectionString, true);
                config.AbortOnConnectFail = false;
                config.ConnectRetry = 3;
                config.ConnectTimeout = 2000;
                config.SyncTimeout = 2000;
                config.KeepAlive = 180;
                return ConnectionMultiplexer.Connect(config);
            });

            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = configuration.GetConnectionString("Redis");
            });

            services.AddSingleton<RedisCacheService>();
            services.AddSingleton<JwtBlacklistService>();

            return services;
        }

        public static IServiceCollection AddCustomSession(this IServiceCollection services)
        {
            services.AddSession(options =>
            {
                options.Cookie.Name = ".JobViet.Session";
                options.IdleTimeout = TimeSpan.FromMinutes(30);
                options.Cookie.HttpOnly = true;
                options.Cookie.IsEssential = true;
                options.Cookie.SecurePolicy = CookieSecurePolicy.None; // Change to Always in production with HTTPS
                options.Cookie.SameSite = SameSiteMode.Lax; // Lax for development
            });
            return services;
        }

        public static IServiceCollection AddCustomDbContexts(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<Server.Data.Jobs.ApplicationDbContext>(options =>
                options.UseOracle(configuration.GetConnectionString("OracleDb")));

            return services;
        }

        public static IServiceCollection AddCustomUnitOfWorkAndRepositories(this IServiceCollection services)
        {
            services.AddScoped<Server.Data.Jobs.IUnitOfWork, Server.Data.Jobs.UnitOfWork>();
            services.AddScoped<IJobRepository, JobRepository>();
            services.AddScoped<IJobCategoryRepository, JobCategoryRepository>();

            services.AddScoped<Server.Data.Auth.IUnitOfWork, Server.Data.Auth.UnitOfWork>();
            services.AddScoped<Server.Data.Profiles.IProfileRepository, Server.Data.Profiles.ProfileRepository>();
            services.AddScoped<Server.Data.Profiles.IProfileUnitOfWork, Server.Data.Profiles.ProfileUnitOfWork>();

            // Notification repositories
            services.AddScoped<INotificationRepository, NotificationRepository>();
            services.AddScoped<IMessageRepository, MessageRepository>();

            return services;
        }

        public static IServiceCollection AddCustomServices(this IServiceCollection services)
        {
            services.AddHttpClient();
            services.AddScoped<IJobService, JobService>();
            services.AddScoped<IBlogService, BlogService>();
            services.AddScoped<IJobCategoryService, JobCategoryService>();
            services.AddScoped<IApplicationService, ApplicationService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<JwtService>();
            services.AddScoped<IProfileService, ProfileService>();

            // Notification services
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<IMessageService, MessageService>();

            // Add SignalR services
            services.AddSignalR(options =>
            {
                options.EnableDetailedErrors = true;
            });

            return services;
        }

        public static IServiceCollection AddCustomAutoMapper(this IServiceCollection services)
        {
            services.AddAutoMapper(typeof(Program));
            return services;
        }

        public static IServiceCollection AddCustomFluentValidation(this IServiceCollection services)
        {
            services.AddFluentValidationAutoValidation();
            services.AddValidatorsFromAssembly(typeof(LoginRequestValidator).Assembly, includeInternalTypes: true);
            return services;
        }

        public static IServiceCollection AddCustomCaching(this IServiceCollection services)
        {
            services.AddMemoryCache();
            return services;
        }

        public static IServiceCollection AddCustomApiVersioning(this IServiceCollection services)
        {
            services.AddApiVersioning(options =>
            {
                options.DefaultApiVersion = new(1, 0);
                options.AssumeDefaultVersionWhenUnspecified = true;
                options.ReportApiVersions = true;
                options.ApiVersionReader = new UrlSegmentApiVersionReader();
            });
            return services;
        }

        public static IServiceCollection AddCustomSwagger(this IServiceCollection services)
        {
            services.AddSwaggerGen(c =>
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
            return services;
        }

        public static IServiceCollection AddCustomHealthChecks(this IServiceCollection services)
        {
            services.AddHealthChecks();
            return services;
        }

        public static IServiceCollection AddCustomCors(this IServiceCollection services, IConfiguration configuration)
        {
            var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
            services.AddCors(options =>
            {
                options.AddDefaultPolicy(policy =>
                {
                    policy.WithOrigins(allowedOrigins ?? new string[] { })
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials();
                });
            });
            return services;
        }

        public static IServiceCollection AddCustomAuthentication(this IServiceCollection services)
        {
            services.AddAuthentication("Cookies")
                .AddCookie("Cookies", options =>
                {
                    options.Cookie.HttpOnly = true;
                    options.Cookie.SecurePolicy = CookieSecurePolicy.None; // Match session cookie settings
                    options.Cookie.SameSite = SameSiteMode.Lax; // Lax for development
                    options.LoginPath = "/auth/login";
                    options.LogoutPath = "/auth/logout";
                    options.Events.OnRedirectToLogin = context =>
                    {
                        // For API requests, return 401 instead of redirecting to login page
                        if (context.Request.Path.StartsWithSegments("/api"))
                        {
                            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                            return Task.CompletedTask;
                        }
                        // For non-API requests, proceed with default redirect behavior
                        return Task.CompletedTask;
                    };
                });
            return services;
        }
    }
}
