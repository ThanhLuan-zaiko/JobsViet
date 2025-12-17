using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Server.Models;
using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;

namespace Server.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (ApiException ex)
            {
                _logger.LogWarning(ex, "API Exception: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex.StatusCode, ex.Message, ex.ErrorCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
                await HandleExceptionAsync(context, (int)HttpStatusCode.InternalServerError, "An unexpected error occurred.", "InternalServerError");
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, int statusCode, string message, string errorCode)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = statusCode;

            var response = new
            {
                StatusCode = statusCode,
                ErrorCode = errorCode,
                Message = message,
                Timestamp = DateTime.UtcNow
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
