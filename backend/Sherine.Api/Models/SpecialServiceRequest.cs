namespace Sherine.Api.Models
{
    public class SpecialServiceRequest
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public int BookingId { get; set; }
        public string ServiceType { get; set; } = string.Empty; // WiFi, ChildSeat, ExtraLuggage, etc.
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // Pending | Approved | Rejected | Completed
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ProcessedAt { get; set; }
        public string? ProcessedBy { get; set; }
        public string? Notes { get; set; }

        // Navigation properties
        public ApplicationUser? User { get; set; }
        public Booking? Booking { get; set; }
    }
}
