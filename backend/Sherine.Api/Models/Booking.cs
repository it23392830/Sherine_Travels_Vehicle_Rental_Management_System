namespace Sherine.Api.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public int VehicleId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Kilometers { get; set; }
        public bool WithDriver { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal PaidAmount { get; set; } = 0m;
        public string Status { get; set; } = "Pending"; // Pending | Confirmed | Cancelled | Completed
        public string PaymentStatus { get; set; } = "Pending"; // Pending | Paid | PayAtPickup
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ApplicationUser? User { get; set; }
        public Vehicle? Vehicle { get; set; }
    }
}
