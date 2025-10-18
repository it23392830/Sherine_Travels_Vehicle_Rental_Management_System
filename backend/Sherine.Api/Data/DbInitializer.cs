using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Sherine.Api.Models;

namespace Sherine.Api.Data
{
    public class DbInitializer
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;

        public DbInitializer(RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration,
            ApplicationDbContext context)
        {
            _roleManager = roleManager;
            _userManager = userManager;
            _configuration = configuration;
            _context = context;
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

            // ✅ Seed Chat Contacts
            await SeedChatContactsAsync();
        }

        private async Task SeedChatContactsAsync()
        {
            // Check if chat contacts already exist
            if (await _context.ChatContacts.AnyAsync())
            {
                return; // Data already seeded
            }

            var chatContacts = new List<ChatContact>
            {
                new ChatContact
                {
                    Name = "Sherine Travels Manager",
                    PhoneNumber = "+94771234567", // Replace with actual manager phone number
                    Role = "Manager",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new ChatContact
                {
                    Name = "Customer Support",
                    PhoneNumber = "+94777654321", // Replace with actual support phone number
                    Role = "Manager",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            };

            _context.ChatContacts.AddRange(chatContacts);
            await _context.SaveChangesAsync();
        }
    }
}

