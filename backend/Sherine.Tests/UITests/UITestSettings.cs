namespace Sherine.Tests.UITests;

public class UITestSettings
{
        public string? BaseUrl { get; set; }
    public Dictionary<string, UserCredentials> Users { get; set; } = new();
}

public class UserCredentials
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
