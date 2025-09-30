namespace Sherine.Api.Models
{
    public class Driver
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string LicenseNumber { get; set; } = string.Empty;
        public string Contact { get; set; } = string.Empty;
        public string Status { get; set; } = "Available"; // Available | Assigned | Inactive

        // Optional relation to Vehicle
        public int? VehicleId { get; set; }
        public Vehicle? Vehicle { get; set; }
    }
}


