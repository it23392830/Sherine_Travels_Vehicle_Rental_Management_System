using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Sherine.Api.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Sherine.Api.Services
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration;
        public TokenService(IConfiguration configuration) => _configuration = configuration;

        public Task<string> CreateTokenAsync(ApplicationUser user, IList<string> roles)
        {
            var jwtSection = _configuration.GetSection("JwtSettings");
            var secret = jwtSection["Secret"];
            var issuer = jwtSection["Issuer"];
            var audience = jwtSection["Audience"];
            var expiresInMinutes = int.Parse(jwtSection["ExpiryMinutes"] ?? "60");

            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
                new Claim(ClaimTypes.Name, user.UserName ?? "")
            };

            foreach (var role in roles)
                authClaims.Add(new Claim(ClaimTypes.Role, role));

            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                expires: DateTime.UtcNow.AddMinutes(expiresInMinutes),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            var tokenStr = new JwtSecurityTokenHandler().WriteToken(token);
            return Task.FromResult(tokenStr);
        }
    }
}
