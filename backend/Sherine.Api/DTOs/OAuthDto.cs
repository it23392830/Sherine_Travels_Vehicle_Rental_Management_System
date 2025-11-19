namespace Sherine.Api.DTOs
{
    public class OAuthDto
    {
        public string Provider { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? RequestedRole { get; set; }
    }
}


