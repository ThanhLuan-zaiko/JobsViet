using System;

namespace Server.Models
{
    public class ApiException : Exception
    {
        public int StatusCode { get; }
        public string ErrorCode { get; }

        public ApiException(string message, int statusCode = 500, string errorCode = "InternalServerError")
            : base(message)
        {
            StatusCode = statusCode;
            ErrorCode = errorCode;
        }

        public ApiException(string message, Exception innerException, int statusCode = 500, string errorCode = "InternalServerError")
            : base(message, innerException)
        {
            StatusCode = statusCode;
            ErrorCode = errorCode;
        }
    }
}
