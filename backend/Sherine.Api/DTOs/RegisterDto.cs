namespace Sherine.Api.DTOs
{
    public class RegisterDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }

        // Optional, helps frontend send role directly
        public string? Role { get; set; }
    }
}
