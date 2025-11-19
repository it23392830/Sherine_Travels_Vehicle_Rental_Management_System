using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sherine.Api.Data;
using Sherine.Api.Models;

namespace Sherine.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;

        public PaymentController(
            ApplicationDbContext db,
            UserManager<ApplicationUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        [HttpPost("create-paypal-order")]
        public async Task<IActionResult> CreatePayPalOrder([FromBody] CreatePaymentRequest request)
        {
            try
            {
                var userId = _userManager.GetUserId(User);
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                // Parse booking ID (remove "BK" prefix and convert to int)
                var bookingIdStr = request.BookingId.Replace("BK", "");
                if (!int.TryParse(bookingIdStr, out int bookingId))
                    return BadRequest(new { message = "Invalid booking ID format" });

                // Get booking details
                var booking = await _db.Bookings
                    .Include(b => b.Vehicle)
                    .FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId);

                if (booking == null)
                    return NotFound(new { message = "Booking not found" });

                if (booking.PaymentStatus == "Paid")
                    return BadRequest(new { message = "Booking is already paid" });

                // Convert LKR to USD (approximate rate: 1 USD = 300 LKR)
                var amountInUSD = Math.Round(booking.TotalPrice / 300m, 2);

                var bookingIdFormatted = $"BK{booking.Id:D6}";

                // For now, create a mock PayPal order ID
                var orderId = $"PAYPAL_{Guid.NewGuid().ToString("N")[..10].ToUpper()}";

                return Ok(new
                {
                    orderId = orderId,
                    amount = amountInUSD,
                    currency = "USD",
                    bookingId = bookingIdFormatted
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create PayPal order", error = ex.Message });
            }
        }

        [HttpPost("capture-paypal-order")]
        public async Task<IActionResult> CapturePayPalOrder([FromBody] CapturePaymentRequest request)
        {
            try
            {
                var userId = _userManager.GetUserId(User);
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                // Parse booking ID (remove "BK" prefix and convert to int)
                var bookingIdStr = request.BookingId.Replace("BK", "");
                if (!int.TryParse(bookingIdStr, out int bookingId))
                    return BadRequest(new { message = "Invalid booking ID format" });

                // Get booking by ID
                var booking = await _db.Bookings
                    .FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId);

                if (booking == null)
                    return NotFound(new { message = "Booking not found" });

                // For now, simulate successful payment capture
                // Update booking status
                booking.PaymentStatus = "Paid";
                booking.Status = "Confirmed";
                booking.PaidAmount = booking.TotalPrice;
                await _db.SaveChangesAsync();

                return Ok(new
                {
                    message = "Payment successful",
                    bookingId = $"BK{booking.Id:D6}",
                    status = booking.Status,
                    paymentStatus = booking.PaymentStatus
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to capture payment", error = ex.Message });
            }
        }

        [HttpPost("update-booking-status")]
        public async Task<IActionResult> UpdateBookingStatus([FromBody] UpdateBookingStatusRequest request)
        {
            try
            {
                var userId = _userManager.GetUserId(User);
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                // Parse booking ID (remove "BK" prefix and convert to int)
                var bookingIdStr = request.BookingId.Replace("BK", "");
                if (!int.TryParse(bookingIdStr, out int bookingId))
                    return BadRequest(new { message = "Invalid booking ID format" });

                // Get booking by ID
                var booking = await _db.Bookings
                    .FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId);

                if (booking == null)
                    return NotFound(new { message = "Booking not found" });

                // Update booking status
                booking.PaymentStatus = "Paid";
                booking.Status = "Confirmed";
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

    public class CreatePaymentRequest
    {
        public string BookingId { get; set; } = string.Empty;
    }

    public class CapturePaymentRequest
    {
        public string OrderId { get; set; } = string.Empty;
        public string BookingId { get; set; } = string.Empty;
    }

    public class UpdateBookingStatusRequest
    {
        public string BookingId { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
    }
}
