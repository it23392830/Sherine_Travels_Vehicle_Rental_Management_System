using Sherine.Api.Models;

namespace Sherine.Api.Services
{
    public interface ITokenService
    {
        Task<string> CreateTokenAsync(ApplicationUser user, IList<string> roles);
    }
}
