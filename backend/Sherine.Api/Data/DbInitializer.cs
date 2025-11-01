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
            Console.WriteLine($"Seeding Owner: {ownerEmail}");

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
            Console.WriteLine($"Seeding Manager: {managerEmail}");

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

            // ✅ Seed Driver
            var driverEmail = _configuration["SeedDriver:Email"] ?? "driver@example.com";
            var driverPassword = _configuration["SeedDriver:Password"] ?? "Driver@123";
            Console.WriteLine($"Seeding Driver: {driverEmail}");

            var driver = await _userManager.FindByEmailAsync(driverEmail);
            if (driver == null)
            {
                driver = new ApplicationUser
                {
                    Email = driverEmail,
                    UserName = driverEmail,
                    FullName = "Test Driver"
                };

                var result = await _userManager.CreateAsync(driver, driverPassword);
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(driver, "Driver");
                }
            }

            // ✅ Seed Client
            var clientEmail = _configuration["SeedClient:Email"] ?? "client@example.com";
            var clientPassword = _configuration["SeedClient:Password"] ?? "Client@123";
            Console.WriteLine($"Seeding Client: {clientEmail}");

            var client = await _userManager.FindByEmailAsync(clientEmail);
            if (client == null)
            {
                client = new ApplicationUser
                {
                    Email = clientEmail,
                    UserName = clientEmail,
                    FullName = "Test Client"
                };

                var result = await _userManager.CreateAsync(client, clientPassword);
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(client, "User");
                }
            }

            // ✅ Seed Vehicles
            if (!_context.Vehicles.Any())
            {
                _context.Vehicles.AddRange(
                    new Vehicle { Type = "Car", Number = "V001", Seats = 4, PricePerKmWithDriver = 100, PricePerKmWithoutDriver = 80, PriceForOvernight = 2000, Status = "Available" },
                    new Vehicle { Type = "Van", Number = "V002", Seats = 8, PricePerKmWithDriver = 150, PricePerKmWithoutDriver = 120, PriceForOvernight = 3000, Status = "Available" },
                    new Vehicle { Type = "Bus", Number = "V003", Seats = 20, PricePerKmWithDriver = 200, PricePerKmWithoutDriver = 150, PriceForOvernight = 4000, Status = "Available" }
                );
                await _context.SaveChangesAsync();
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

