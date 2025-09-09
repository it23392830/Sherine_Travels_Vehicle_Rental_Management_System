using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Sherine.Api.Models;

namespace Sherine.Api.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        // Add future DbSets here (Vehicles, Bookings, etc)
        // public DbSet<Vehicle> Vehicles { get; set; }
    }
}
