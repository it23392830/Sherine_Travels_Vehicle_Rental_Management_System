namespace Sherine.Api.Models
{
    public class Vehicle
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;   // e.g., Car, Van, Bus
        public decimal Price { get; set; }                 // rental price
        public string Status { get; set; } = "Available"; // Available | Booked | Maintenance
    }
}
