using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Sherine.Api.Data;
using Sherine.Api.DTOs;
using Sherine.Api.Models;

namespace Sherine.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Manager,Owner")]
    public class ManagerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public ManagerController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // ✅ Get all registered drivers (Driver role)
        [HttpGet("drivers")]
        public async Task<IActionResult> GetRegisteredDrivers()
        {
            var allUsers = await _userManager.Users.ToListAsync();
            var drivers = new List<object>();

            foreach (var user in allUsers)
            {
                var roles = await _userManager.GetRolesAsync(user);
                if (roles.Contains("Driver"))
                {
                    // link to Drivers table record if exists
                    var driverRecord = await _context.Drivers
                        .Include(d => d.Vehicle)
                        .FirstOrDefaultAsync(d => d.Contact == user.Email || d.Name == user.FullName);

                    drivers.Add(new
                    {
                        Id = user.Id,
                        Name = user.FullName,
                        Email = user.Email,
                        Status = driverRecord?.Status ?? "Available",
                        Vehicle = driverRecord?.Vehicle != null
                            ? new
                            {
                                driverRecord.Vehicle.Id,
                                driverRecord.Vehicle.Number,
                                driverRecord.Vehicle.Type
                            }
                            : null
                    });
                }
            }

            return Ok(drivers);
        }

        // ✅ Get all vehicles (with any assigned driver info)
        [HttpGet("vehicles")]
        public async Task<IActionResult> GetVehicles()
        {
            var vehicles = await _context.Vehicles.AsNoTracking().ToListAsync();

            var result = vehicles.Select(v => new
            {
                v.Id,
                v.Number,
                v.Type,
                v.Seats,
                v.Status,
                AssignedDriver = _context.Drivers
                    .Where(d => d.VehicleId == v.Id)
                    .Select(d => new { d.Id, d.Name })
                    .FirstOrDefault()
            });

            return Ok(result);
        }

        // ✅ Assign driver to vehicle
        [HttpPost("assign-driver")]
        public async Task<IActionResult> AssignDriver([FromBody] AssignDriverDto dto)
        {
            var vehicle = await _context.Vehicles.FindAsync(dto.VehicleId);
            if (vehicle == null)
                return NotFound(new { message = "Vehicle not found" });

            var user = await _userManager.FindByIdAsync(dto.DriverId.ToString());
            if (user == null)
                return NotFound(new { message = "Driver not found" });

            var existingVehicleDriver = await _context.Drivers.FirstOrDefaultAsync(d => d.VehicleId == dto.VehicleId);
            if (existingVehicleDriver != null)
                return BadRequest(new { message = "Vehicle already has a driver" });

            var driverRecord = await _context.Drivers.FirstOrDefaultAsync(d => d.Contact == user.Email);
            if (driverRecord == null)
            {
                driverRecord = new Driver
                {
                    Name = user.FullName,
                    Contact = user.Email,
                    LicenseNumber = $"AUTO-{user.Id.Substring(0, 6)}",
                    VehicleId = dto.VehicleId,
                    Status = "Assigned"
                };
                _context.Drivers.Add(driverRecord);
            }
            else
            {
                driverRecord.VehicleId = dto.VehicleId;
                driverRecord.Status = "Assigned";
                _context.Drivers.Update(driverRecord);
            }

            vehicle.Status = "Booked";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Driver assigned successfully" });
        }

        // ✅ Unassign driver from vehicle
        [HttpPost("unassign-driver/{driverEmail}")]
        public async Task<IActionResult> UnassignDriver([FromRoute] string driverEmail)
        {
            var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.Contact == driverEmail);
            if (driver == null)
                return NotFound(new { message = "Driver not found" });

            var vehicle = await _context.Vehicles.FindAsync(driver.VehicleId);
            if (vehicle != null)
                vehicle.Status = "Available";

            driver.VehicleId = null;
            driver.Status = "Available";

            await _context.SaveChangesAsync();
            return Ok(new { message = "Driver unassigned successfully" });
        }

        // ✅ Get all bookings for manager
        [HttpGet("bookings")]
        public async Task<IActionResult> GetAllBookings()
        {
            var bookings = await _context.Bookings
                .Include(b => b.Vehicle)
                .Include(b => b.User)
                .Include(b => b.Driver)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            var result = bookings.Select(b => new
            {
                b.Id,
                BookingId = $"BK{b.Id:D6}",
                b.VehicleId,
                VehicleType = b.Vehicle?.Type ?? "Unknown",
                b.StartDate,
                b.EndDate,
                b.Kilometers,
                b.WithDriver,
                b.TotalPrice,
                b.Status,
                b.PaymentStatus,
                b.DriverId,
                b.DriverName,
                b.DriverEmail,
                UserName = b.User?.FullName ?? "Unknown",
                UserEmail = b.User?.Email ?? "Unknown"
            });

            return Ok(result);
        }

        // ✅ Assign driver to booking
        [HttpPost("assign-driver-to-booking")]
        public async Task<IActionResult> AssignDriverToBooking([FromBody] AssignDriverToBookingDto dto)
        {
            var booking = await _context.Bookings.FindAsync(dto.BookingId);
            if (booking == null)
                return NotFound(new { message = "Booking not found" });

            if (!booking.WithDriver)
                return BadRequest(new { message = "This booking does not require a driver" });

            var user = await _userManager.FindByIdAsync(dto.DriverId);
            if (user == null)
                return NotFound(new { message = "Driver not found" });

            // Check if driver is available
            var driverRecord = await _context.Drivers.FirstOrDefaultAsync(d => d.Contact == user.Email);
            if (driverRecord == null || driverRecord.Status != "Available")
                return BadRequest(new { message = "Driver is not available" });

            // If booking already has a driver, unassign the old one first
            if (booking.DriverId.HasValue)
            {
                var oldDriver = await _context.Drivers.FindAsync(booking.DriverId.Value);
                if (oldDriver != null)
                {
                    oldDriver.Status = "Available";
                }
            }

            // Assign driver to booking
            booking.DriverId = driverRecord.Id;
            booking.DriverName = user.FullName;
            booking.DriverEmail = user.Email;

            // Update driver status
            driverRecord.Status = "Assigned";

            await _context.SaveChangesAsync();
            return Ok(new { message = "Driver assigned to booking successfully" });
        }

        // ✅ Change driver for booking
        [HttpPost("change-driver-for-booking")]
        public async Task<IActionResult> ChangeDriverForBooking([FromBody] AssignDriverToBookingDto dto)
        {
            var booking = await _context.Bookings.FindAsync(dto.BookingId);
            if (booking == null)
                return NotFound(new { message = "Booking not found" });

            if (!booking.WithDriver)
                return BadRequest(new { message = "This booking does not require a driver" });

            var user = await _userManager.FindByIdAsync(dto.DriverId);
            if (user == null)
                return NotFound(new { message = "Driver not found" });

            // Check if driver is available
            var driverRecord = await _context.Drivers.FirstOrDefaultAsync(d => d.Contact == user.Email);
            if (driverRecord == null || driverRecord.Status != "Available")
                return BadRequest(new { message = "Driver is not available" });

            // Unassign current driver if exists
            if (booking.DriverId.HasValue)
            {
                var currentDriver = await _context.Drivers.FindAsync(booking.DriverId.Value);
                if (currentDriver != null)
                {
                    currentDriver.Status = "Available";
                }
            }

            // Assign new driver to booking
            booking.DriverId = driverRecord.Id;
            booking.DriverName = user.FullName;
            booking.DriverEmail = user.Email;

            // Update new driver status
            driverRecord.Status = "Assigned";

            await _context.SaveChangesAsync();
            return Ok(new { message = "Driver changed successfully" });
        }

        // ✅ Unassign driver from booking
        [HttpPost("unassign-driver-from-booking")]
        public async Task<IActionResult> UnassignDriverFromBooking([FromBody] UnassignDriverFromBookingDto dto)
        {
            var booking = await _context.Bookings.FindAsync(dto.BookingId);
            if (booking == null)
                return NotFound(new { message = "Booking not found" });

            if (!booking.DriverId.HasValue)
                return BadRequest(new { message = "No driver assigned to this booking" });

            // Unassign current driver
            var currentDriver = await _context.Drivers.FindAsync(booking.DriverId.Value);
            if (currentDriver != null)
            {
                currentDriver.Status = "Available";
            }

            // Clear driver assignment from booking
            booking.DriverId = null;
            booking.DriverName = null;
            booking.DriverEmail = null;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Driver unassigned successfully" });
        }
    }
}
