using Microsoft.AspNetCore.Identity;

namespace Sherine.Api.Models
{
    public class ApplicationUser : IdentityUser
    {
        // Add additional profile fields if required
        public string FullName { get; set; }
    }
}
