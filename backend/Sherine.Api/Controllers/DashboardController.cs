using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Sherine.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        [Authorize(Roles = "Owner")]
        [HttpGet("owner")]
        public IActionResult OwnerDashboard()
        {
            // stubbed data for Sprint 1 - replace with real queries later
            var data = new
            {
                totalRides = 120,
                totalRevenue = 58000,
                vehiclesInUse = 34
            };
            return Ok(data);
        }

        [Authorize(Roles = "Manager")]
        [HttpGet("manager")]
        public IActionResult ManagerDashboard()
        {
            var data = new
            {
                pendingBookings = 6,
                unassignedDrivers = 2,
                openComplaints = 3
            };
            return Ok(data);
        }

        [Authorize(Roles = "User")]
        [HttpGet("user")]
        public IActionResult UserDashboard()
        {
            var data = new
            {
                upcomingBookings = new[] {
                    new { bookingId = "B001", date = DateTime.UtcNow.AddDays(2), vehicle = "Toyota Prius" }
                },
                pastBookingsCount = 5
            };
            return Ok(data);
        }

        [Authorize(Roles = "Driver")]
        [HttpGet("driver")]
        public IActionResult DriverDashboard()
        {
            var data = new
            {
                assignedRides = new[] {
                    new { rideId = "R123", pickup = "Colombo", time = DateTime.UtcNow.AddHours(3) }
                },
                earningsToday = 1200
            };
            return Ok(data);
        }
    }
}
