namespace Sherine.Api.Models
{
    public class Vehicle
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;   
        public string Number { get; set; } = string.Empty; // vehicle registration number
        public decimal PriceWithDriver { get; set; }       // price if rented with driver
        public decimal PriceWithoutDriver { get; set; }    // price if rented without driver
        public int Seats { get; set; }                     // number of seats
        public string Status { get; set; } = "Available";  // Available | Booked | Maintenance
        public string? ImageUrl1 { get; set; }
        public string? ImageUrl2 { get; set; }
    }
}
