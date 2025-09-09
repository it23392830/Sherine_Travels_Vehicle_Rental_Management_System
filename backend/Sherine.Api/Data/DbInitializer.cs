using Microsoft.AspNetCore.Identity;
using Sherine.Api.Models;

namespace Sherine.Api.Data
{
    public class DbInitializer
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;

        public DbInitializer(RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration)
        {
            _roleManager = roleManager;
            _userManager = userManager;
            _configuration = configuration;
        }

        public async Task SeedRolesAndAdminAsync()
        {
            // ✅ Ensure all roles exist
            var roles = new[] { "Owner", "Manager", "User", "Driver" };
            foreach (var role in roles)
            {
                if (!await _roleManager.RoleExistsAsync(role))
                    await _roleManager.CreateAsync(new IdentityRole(role));
            }

            // ✅ Seed Owner (Super Admin)
            var ownerEmail = _configuration["SeedAdmin:Email"] ?? "owner@example.com";
            var ownerPassword = _configuration["SeedAdmin:Password"] ?? "Owner@123";

            var owner = await _userManager.FindByEmailAsync(ownerEmail);
            if (owner == null)
            {
                owner = new ApplicationUser
                {
                    Email = ownerEmail,
                    UserName = ownerEmail,
                    FullName = "System Owner"
                };

                var result = await _userManager.CreateAsync(owner, ownerPassword);
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(owner, "Owner");
                }
            }

            // ✅ Seed Manager (Admin)
            var managerEmail = _configuration["SeedManager:Email"] ?? "manager@example.com";
            var managerPassword = _configuration["SeedManager:Password"] ?? "Manager@123";

            var manager = await _userManager.FindByEmailAsync(managerEmail);
            if (manager == null)
            {
                manager = new ApplicationUser
                {
                    Email = managerEmail,
                    UserName = managerEmail,
                    FullName = "System Manager"
                };

                var result = await _userManager.CreateAsync(manager, managerPassword);
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(manager, "Manager");
                }
            }
        }
    }
}

