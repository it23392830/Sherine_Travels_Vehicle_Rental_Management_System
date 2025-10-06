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

            // Use requested vehicle if provided, otherwise pick any available
            Vehicle? availableVehicle = null;
            if (dto.VehicleId > 0)
            {
                availableVehicle = await _db.Vehicles.FirstOrDefaultAsync(v => v.Id == dto.VehicleId);
                if (availableVehicle == null)
                    return BadRequest(new { message = "Selected vehicle not found" });
                if (availableVehicle.Status == "Out of Service")
                    return BadRequest(new { message = "Selected vehicle unavailable" });
            }
            if (availableVehicle == null)
            {
                availableVehicle = await _db.Vehicles.FirstOrDefaultAsync(v => v.Status == "Available");
            }

            if (availableVehicle == null)
                return BadRequest(new { message = "No vehicles available" });

            // Calculate price
            // For rental: if start is Jan 1 and end is Jan 3, that's 2 nights (Jan 1-2, Jan 2-3)
            var nights = (dto.EndDate.Date - dto.StartDate.Date).Days; // Number of nights between dates
            var perKmPrice = dto.WithDriver ? availableVehicle.PricePerKmWithDriver : availableVehicle.PricePerKmWithoutDriver;
            var overnightPrice = availableVehicle.PriceForOvernight;
            var totalPrice = (dto.Kilometers * perKmPrice) + (nights * overnightPrice);

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
                Status = "Pending",
                PaymentStatus = dto.PaymentStatus
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
                PaidAmount = booking.PaidAmount,
                BalanceDue = Math.Max(0, booking.TotalPrice - booking.PaidAmount),
                Status = booking.Status,
                PaymentStatus = booking.PaymentStatus,
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

            // Reset vehicle status if booking is completed and end date has passed
            var now = DateTime.UtcNow;
            var bookings = await _db.Bookings
                .Include(b => b.Vehicle)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            foreach (var booking in bookings)
            {
                if (booking.Status == "Completed" && booking.EndDate < now && booking.Vehicle != null && booking.Vehicle.Status == "Booked")
                {
                    booking.Vehicle.Status = "Available";
                }
            }
            await _db.SaveChangesAsync();

            var response = bookings.Select(b => new BookingResponseDto
            {
                Id = b.Id,
                BookingId = $"BK{b.Id:D6}",
                StartDate = b.StartDate,
                EndDate = b.EndDate,
                Kilometers = b.Kilometers,
                WithDriver = b.WithDriver,
                TotalPrice = b.TotalPrice,
                PaidAmount = b.PaidAmount,
                BalanceDue = Math.Max(0, b.TotalPrice - b.PaidAmount),
                Status = b.Status,
                PaymentStatus = b.PaymentStatus,
                VehicleType = b.Vehicle!.Type,
                Message = ""
            }).ToList();

            return Ok(response);
        }

        public class ExtendBookingDto
        {
            public DateTime NewEndDate { get; set; }
        }

        // PUT: api/Booking/{id}/extend
        [HttpPut("{id}/extend")]
        public async Task<ActionResult<BookingResponseDto>> ExtendBooking(int id, [FromBody] ExtendBookingDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var booking = await _db.Bookings.Include(b => b.Vehicle).FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
            if (booking == null) return NotFound();
            if (dto.NewEndDate <= booking.StartDate) return BadRequest(new { message = "New end date must be after start date" });

            // Recalculate total based on new nights
            var oldTotal = booking.TotalPrice;
            var nights = (dto.NewEndDate.Date - booking.StartDate.Date).Days;
            var perKmPrice = booking.WithDriver ? booking.Vehicle!.PricePerKmWithDriver : booking.Vehicle!.PricePerKmWithoutDriver;
            var overnightPrice = booking.Vehicle!.PriceForOvernight;
            var newTotal = (booking.Kilometers * perKmPrice) + (nights * overnightPrice);

            booking.EndDate = dto.NewEndDate;
            booking.TotalPrice = newTotal;

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
                PaidAmount = booking.PaidAmount,
                BalanceDue = Math.Max(0, booking.TotalPrice - booking.PaidAmount),
                Status = booking.Status,
                PaymentStatus = booking.PaymentStatus,
                VehicleType = booking.Vehicle!.Type,
                Message = oldTotal == newTotal ? "No change" : "Booking extended"
            });
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

        // PUT: api/Booking/{id}/pay
        [HttpPut("{id}/pay")]
        public async Task<IActionResult> MarkPaid(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var booking = await _db.Bookings
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

            if (booking == null) return NotFound();

            // Mark as fully paid
            booking.PaymentStatus = "Paid";
            booking.PaidAmount = booking.TotalPrice;
            if (booking.Status == "Pending") booking.Status = "Confirmed";

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // PUT: api/Booking/{id}/pay/partial?amount=xxxxx
        [HttpPut("{id}/pay/partial")]
        public async Task<ActionResult<BookingResponseDto>> PayPartial(int id, [FromQuery] decimal amount)
        {
            if (amount <= 0) return BadRequest(new { message = "Amount must be greater than zero" });

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var booking = await _db.Bookings
                .Include(b => b.Vehicle)
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
            if (booking == null) return NotFound();

            booking.PaidAmount = Math.Min(booking.TotalPrice, booking.PaidAmount + amount);
            if (booking.PaidAmount >= booking.TotalPrice)
            {
                booking.PaymentStatus = "Paid";
                if (booking.Status == "Pending") booking.Status = "Confirmed";
            }
            else
            {
                booking.PaymentStatus = "Pending";
            }

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
                PaidAmount = booking.PaidAmount,
                BalanceDue = Math.Max(0, booking.TotalPrice - booking.PaidAmount),
                Status = booking.Status,
                PaymentStatus = booking.PaymentStatus,
                VehicleType = booking.Vehicle!.Type,
                Message = "Payment recorded"
            });
        }
    }
}

