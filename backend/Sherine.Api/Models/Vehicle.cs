namespace Sherine.Api.Models
{
    public class Vehicle
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;   
        public string Number { get; set; } = string.Empty; // vehicle registration number
    public decimal PricePerKmWithoutDriver { get; set; }    // price per km without driver
    public decimal PricePerKmWithDriver { get; set; }       // price per km with driver
    public decimal PriceForOvernight { get; set; }          // price for overnight stay
        public int Seats { get; set; }                     // number of seats
        public string Status { get; set; } = "Available";  // Available | Booked | Maintenance
        public string? ImageUrl1 { get; set; }
        public string? ImageUrl2 { get; set; }
    }
}
