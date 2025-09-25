using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Sherine.Api.Models;

namespace Sherine.Api.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        // Add future DbSets here (Vehicles, Bookings, etc)
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Driver> Drivers { get; set; }
        public DbSet<Booking> Bookings { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Ensure a vehicle can be assigned to at most one driver
            builder.Entity<Driver>()
                .HasIndex(d => d.VehicleId)
                .IsUnique()
                .HasFilter("\"VehicleId\" IS NOT NULL");
        }
    }
}
