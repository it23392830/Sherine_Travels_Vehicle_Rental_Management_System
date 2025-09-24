using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sherine.Api.Data;
using Sherine.Api.DTOs;
using Sherine.Api.Models;
using System.Security.Claims;

namespace Sherine.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookingController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;

        public BookingController(ApplicationDbContext db, UserManager<ApplicationUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        // POST: api/Booking
        [HttpPost]
        public async Task<ActionResult<BookingResponseDto>> CreateBooking([FromBody] CreateBookingDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            // Find an available vehicle
            var availableVehicle = await _db.Vehicles
                .FirstOrDefaultAsync(v => v.Status == "Available");

            if (availableVehicle == null)
                return BadRequest(new { message = "No vehicles available" });

            // Calculate price
            var days = (dto.EndDate - dto.StartDate).Days + 1;
            var basePrice = dto.WithDriver ? availableVehicle.PriceWithDriver : availableVehicle.PriceWithoutDriver;
            var totalPrice = basePrice * days + (dto.Kilometers * 0.5m); // 0.5 per km

            // Create booking
            var booking = new Booking
            {
                UserId = userId,
                VehicleId = availableVehicle.Id,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Kilometers = dto.Kilometers,
                WithDriver = dto.WithDriver,
                TotalPrice = totalPrice,
                Status = "Pending"
            };

            _db.Bookings.Add(booking);
            await _db.SaveChangesAsync();

            // Update vehicle status
            availableVehicle.Status = "Booked";
            await _db.SaveChangesAsync();

            return Ok(new BookingResponseDto
            {
                Id = booking.Id,
                BookingId = $"BK{booking.Id:D6}",
                StartDate = booking.StartDate,
                EndDate = booking.EndDate,
                Kilometers = booking.Kilometers,
                WithDriver = booking.WithDriver,
                TotalPrice = booking.TotalPrice,
                Status = booking.Status,
                VehicleType = availableVehicle.Type,
                Message = "Booking created successfully"
            });
        }

        // GET: api/Booking (user's bookings)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookingResponseDto>>> GetUserBookings()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var bookings = await _db.Bookings
                .Include(b => b.Vehicle)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new BookingResponseDto
                {
                    Id = b.Id,
                    BookingId = $"BK{b.Id:D6}",
                    StartDate = b.StartDate,
                    EndDate = b.EndDate,
                    Kilometers = b.Kilometers,
                    WithDriver = b.WithDriver,
                    TotalPrice = b.TotalPrice,
                    Status = b.Status,
                    VehicleType = b.Vehicle!.Type,
                    Message = ""
                })
                .ToListAsync();

            return Ok(bookings);
        }

        // PUT: api/Booking/{id}/cancel
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var booking = await _db.Bookings
                .Include(b => b.Vehicle)
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

            if (booking == null) return NotFound();

            if (booking.Status != "Pending" && booking.Status != "Confirmed")
                return BadRequest(new { message = "Cannot cancel this booking" });

            booking.Status = "Cancelled";
            
            // Free up the vehicle
            if (booking.Vehicle != null)
            {
                booking.Vehicle.Status = "Available";
            }

            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}

