namespace Sherine.Api.DTOs
{
    public class CreateBookingDto
    {
        public int VehicleId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Kilometers { get; set; }
        public bool WithDriver { get; set; }
        public string PaymentStatus { get; set; } = "Pending"; // Pending | Paid | PayAtPickup
    }

    public class BookingResponseDto
    {
        public int Id { get; set; }
        public string BookingId { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Kilometers { get; set; }
        public bool WithDriver { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal BalanceDue { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public string VehicleType { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}

