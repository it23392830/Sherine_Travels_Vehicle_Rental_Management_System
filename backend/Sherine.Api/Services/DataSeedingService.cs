using Microsoft.EntityFrameworkCore;
using Sherine.Api.Data;
using Sherine.Api.Models;

namespace Sherine.Api.Services
{
    public class DataSeedingService
    {
        private readonly ApplicationDbContext _context;

        public DataSeedingService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task SeedChatContactsAsync()
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

        public async Task SeedAllDataAsync()
        {
            await SeedChatContactsAsync();
            // Add other seeding methods here as needed
        }
    }
}
