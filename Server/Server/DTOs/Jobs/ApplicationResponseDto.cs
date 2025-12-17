using System;

namespace Server.DTOs.Jobs
{
    public class ApplicationResponseDto
    {
        public string Message { get; set; } = string.Empty;
        public string MessageType { get; set; } = "success"; // success, error, warning, info
        public Guid? ApplicationId { get; set; }
    }
}

