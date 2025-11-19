using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sherine.Api.Data;

namespace Sherine.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestPaymentController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public TestPaymentController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpPost("update-booking-simple")]
        public async Task<IActionResult> UpdateBookingSimple([FromBody] SimpleUpdateRequest request)
        {
            try
            {
                // Parse booking ID (remove "BK" prefix and convert to int)
                var bookingIdStr = request.BookingId.Replace("BK", "");
                if (!int.TryParse(bookingIdStr, out int bookingId))
                    return BadRequest(new { message = "Invalid booking ID format" });

                // Get booking by ID (without user check for testing)
                var booking = await _db.Bookings
                    .FirstOrDefaultAsync(b => b.Id == bookingId);

                if (booking == null)
                    return NotFound(new { message = "Booking not found" });

                // Update booking status with PayPal payment tracking
                booking.PaymentStatus = "PaidOnline";  // Different from "PayAtPickup"
                booking.Status = "have to ride";
                booking.PaidAmount = booking.TotalPrice;
                
                await _db.SaveChangesAsync();

                return Ok(new
                {
                    message = "Booking status updated successfully",
                    bookingId = $"BK{booking.Id:D6}",
                    status = booking.Status,
                    paymentStatus = booking.PaymentStatus,
                    transactionId = request.TransactionId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update booking status", error = ex.Message });
            }
        }
    }

    public class SimpleUpdateRequest
    {
        public string BookingId { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
    }
}
