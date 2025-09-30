using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Sherine.Api.DTOs;
using Sherine.Api.Models;
using Sherine.Api.Services;

namespace Sherine.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ITokenService _tokenService;
        private readonly IHostEnvironment _env;

        public AuthController(UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ITokenService tokenService,
            IHostEnvironment env)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _tokenService = tokenService;
            _env = env;
        }

        /// <summary>
        /// Register new account. 
        /// Only "User" and "Driver" roles are allowed for self-registration.
        /// Owner and Manager are seeded accounts (cannot self-register).
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto, [FromQuery] string userType = "User")
        {
            var userExists = await _userManager.FindByEmailAsync(dto.Email);
            if (userExists != null) return BadRequest("User already exists");

            var user = new ApplicationUser
            {
                Email = dto.Email,
                UserName = dto.Email,
                FullName = dto.FullName
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded) return BadRequest(result.Errors);

            //  Only allow User or Driver at registration
            var role = userType.Equals("Driver", StringComparison.OrdinalIgnoreCase) ? "Driver" : "User";

            if (!await _roleManager.RoleExistsAsync(role))
            {
                await _roleManager.CreateAsync(new IdentityRole(role));
            }

            await _userManager.AddToRoleAsync(user, role);

            return Ok(new { message = $"Account created as {role}" });
        }

        /// <summary>
        /// Login with email & password. Returns JWT token and roles.
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null) return Unauthorized("Invalid credentials");

            if (!await _userManager.CheckPasswordAsync(user, dto.Password))
                return Unauthorized("Invalid credentials");

            var roles = await _userManager.GetRolesAsync(user);
            var token = await _tokenService.CreateTokenAsync(user, roles);

            return Ok(new { token, roles });
        }

        /// <summary>
        /// Development-only login helper: creates user if missing and returns token without strict checks.
        /// </summary>
        [HttpPost("dev-login")]
        public async Task<IActionResult> DevLogin([FromBody] LoginDto dto)
        {
            if (!_env.IsDevelopment()) return NotFound();

            var email = dto.Email;
            var password = dto.Password;
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                return BadRequest("Email and password required");

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                user = new ApplicationUser { Email = email, UserName = email, FullName = email };
                var createRes = await _userManager.CreateAsync(user, password);
                if (!createRes.Succeeded)
                {
                    // if creation failed due to password complexity, create without password
                    var createNoPass = await _userManager.CreateAsync(user);
                    if (!createNoPass.Succeeded) return Unauthorized("Unable to create dev user");
                    // set a known password
                    await _userManager.RemovePasswordAsync(user);
                    await _userManager.AddPasswordAsync(user, password);
                }
                // Assign role based on email hint; default User
                var role = email.Contains("manager") ? "Manager" : email.Contains("owner") ? "Owner" : "User";
                if (!await _roleManager.RoleExistsAsync(role)) await _roleManager.CreateAsync(new IdentityRole(role));
                await _userManager.AddToRoleAsync(user, role);
            }
            else
            {
                // ensure password works
                if (!await _userManager.CheckPasswordAsync(user, password))
                {
                    await _userManager.RemovePasswordAsync(user);
                    await _userManager.AddPasswordAsync(user, password);
                }
            }

            var roles = await _userManager.GetRolesAsync(user);
            var token = await _tokenService.CreateTokenAsync(user, roles);
            return Ok(new { token, roles });
        }

        /// <summary>
        /// OAuth sign-in/up. Creates the user if not exists (User/Driver only) and returns JWT.
        /// </summary>
        [HttpPost("oauth")]
        public async Task<IActionResult> OAuth([FromBody] Sherine.Api.DTOs.OAuthDto dto)
        {
            string email = dto.Email;
            string fullName = string.IsNullOrWhiteSpace(dto.FullName) ? dto.Email : dto.FullName;
            string requestedRole = dto.RequestedRole ?? "User";

            if (string.IsNullOrWhiteSpace(email)) return BadRequest(new { message = "Email is required" });

            var allowedRole = requestedRole?.Equals("Driver", StringComparison.OrdinalIgnoreCase) == true ? "Driver" : "User";

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                user = new ApplicationUser
                {
                    Email = email,
                    UserName = email,
                    FullName = fullName
                };

                var create = await _userManager.CreateAsync(user);
                if (!create.Succeeded) return BadRequest(create.Errors);

                if (!await _roleManager.RoleExistsAsync(allowedRole))
                {
                    await _roleManager.CreateAsync(new IdentityRole(allowedRole));
                }
                await _userManager.AddToRoleAsync(user, allowedRole);
            }

            var roles = await _userManager.GetRolesAsync(user);

            // If a role is requested (User/Driver), align the account to that single role
            if (!string.IsNullOrWhiteSpace(requestedRole))
            {
                var desiredRole = requestedRole.Equals("Driver", StringComparison.OrdinalIgnoreCase) ? "Driver" : "User";

                // Ensure role exists
                if (!await _roleManager.RoleExistsAsync(desiredRole))
                {
                    await _roleManager.CreateAsync(new IdentityRole(desiredRole));
                }

                // Remove the other role if present
                var otherRole = desiredRole == "Driver" ? "User" : "Driver";
                if (roles.Contains(otherRole))
                {
                    await _userManager.RemoveFromRoleAsync(user, otherRole);
                    roles = await _userManager.GetRolesAsync(user);
                }

                // Add desired role if missing
                if (!roles.Contains(desiredRole))
                {
                    await _userManager.AddToRoleAsync(user, desiredRole);
                    roles = await _userManager.GetRolesAsync(user);
                }
            }

            if (!roles.Contains("User") && !roles.Contains("Driver"))
            {
                return Unauthorized(new { message = "Account role is not permitted for OAuth." });
            }

            var token = await _tokenService.CreateTokenAsync(user, roles);
            return Ok(new { token, roles });
        }

        // ❌ Removed AssignRole endpoint 
        // Managers and Owners must be seeded in DbInitializer, not assigned via API
    }
}

