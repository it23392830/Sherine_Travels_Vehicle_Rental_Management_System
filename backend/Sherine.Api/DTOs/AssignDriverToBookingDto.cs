namespace Sherine.Api.DTOs
{
    public class AssignDriverToBookingDto
    {
        public int BookingId { get; set; }
        public string DriverId { get; set; } = string.Empty;
    }
}
