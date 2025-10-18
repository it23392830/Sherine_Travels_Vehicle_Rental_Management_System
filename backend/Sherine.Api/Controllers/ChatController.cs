using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sherine.Api.Data;
using Sherine.Api.Models;
using System.Security.Claims;

namespace Sherine.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ChatController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/chat/contacts
        [HttpGet("contacts")]
        public async Task<ActionResult<IEnumerable<ChatContact>>> GetChatContacts()
        {
            try
            {
                var contacts = await _context.ChatContacts
                    .Where(c => c.IsActive)
                    .OrderBy(c => c.Role)
                    .ThenBy(c => c.Name)
                    .ToListAsync();

                return Ok(contacts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving chat contacts", error = ex.Message });
            }
        }

        // GET: api/chat/contacts/manager
        [HttpGet("contacts/manager")]
        public async Task<ActionResult<ChatContact>> GetManagerContact()
        {
            try
            {
                var manager = await _context.ChatContacts
                    .Where(c => c.Role == "Manager" && c.IsActive)
                    .FirstOrDefaultAsync();

                if (manager == null)
                {
                    return NotFound(new { message = "Manager contact not found" });
                }

                return Ok(manager);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving manager contact", error = ex.Message });
            }
        }

        // GET: api/chat/contacts/driver/{bookingId}
        [HttpGet("contacts/driver/{bookingId}")]
        public async Task<ActionResult<ChatContact>> GetDriverContactByBooking(int bookingId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                // Get the booking and check if it belongs to the user
                var booking = await _context.Bookings
                    .Include(b => b.Vehicle)
                    .Where(b => b.Id == bookingId && b.UserId == userId)
                    .FirstOrDefaultAsync();

                if (booking == null)
                {
                    return NotFound(new { message = "Booking not found or access denied" });
                }

                // Find the driver assigned to this vehicle
                var driver = await _context.Drivers
                    .Where(d => d.VehicleId == booking.VehicleId && d.Status == "Available")
                    .FirstOrDefaultAsync();

                if (driver == null)
                {
                    return NotFound(new { message = "No driver assigned to this booking" });
                }

                // Create a chat contact object for the driver
                var driverContact = new ChatContact
                {
                    Id = driver.Id,
                    Name = driver.Name,
                    PhoneNumber = driver.Contact,
                    Role = "Driver",
                    IsActive = true
                };

                return Ok(driverContact);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving driver contact", error = ex.Message });
            }
        }

        // POST: api/chat/special-service-request
        [HttpPost("special-service-request")]
        public async Task<ActionResult<SpecialServiceRequest>> CreateSpecialServiceRequest([FromBody] CreateSpecialServiceRequestDto request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                // Verify the booking belongs to the user
                var booking = await _context.Bookings
                    .Where(b => b.Id == request.BookingId && b.UserId == userId)
                    .FirstOrDefaultAsync();

                if (booking == null)
                {
                    return NotFound(new { message = "Booking not found or access denied" });
                }

                var serviceRequest = new SpecialServiceRequest
                {
                    UserId = userId,
                    BookingId = request.BookingId,
                    ServiceType = request.ServiceType,
                    Description = request.Description,
                    Status = "Pending",
                    RequestedAt = DateTime.UtcNow
                };

                _context.SpecialServiceRequests.Add(serviceRequest);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetSpecialServiceRequest), new { id = serviceRequest.Id }, serviceRequest);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating special service request", error = ex.Message });
            }
        }

        // GET: api/chat/special-service-request/{id}
        [HttpGet("special-service-request/{id}")]
        public async Task<ActionResult<SpecialServiceRequest>> GetSpecialServiceRequest(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var serviceRequest = await _context.SpecialServiceRequests
                    .Include(sr => sr.Booking)
                    .Where(sr => sr.Id == id && sr.UserId == userId)
                    .FirstOrDefaultAsync();

                if (serviceRequest == null)
                {
                    return NotFound(new { message = "Special service request not found" });
                }

                return Ok(serviceRequest);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving special service request", error = ex.Message });
            }
        }

        // GET: api/chat/special-service-requests
        [HttpGet("special-service-requests")]
        public async Task<ActionResult<IEnumerable<SpecialServiceRequest>>> GetUserSpecialServiceRequests()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var serviceRequests = await _context.SpecialServiceRequests
                    .Include(sr => sr.Booking)
                    .Where(sr => sr.UserId == userId)
                    .OrderByDescending(sr => sr.RequestedAt)
                    .ToListAsync();

                return Ok(serviceRequests);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving special service requests", error = ex.Message });
            }
        }
    }

    // DTOs
    public class CreateSpecialServiceRequestDto
    {
        public int BookingId { get; set; }
        public string ServiceType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}
