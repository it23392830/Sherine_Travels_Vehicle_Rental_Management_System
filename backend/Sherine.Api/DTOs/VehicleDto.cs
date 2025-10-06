using Microsoft.AspNetCore.Http;

namespace Sherine.Api.DTOs
{
    public class VehicleDto
    {
        public string Type { get; set; } = string.Empty;
        public string Number { get; set; } = string.Empty;
        public decimal PricePerKmWithoutDriver { get; set; }
        public decimal PricePerKmWithDriver { get; set; }
        public decimal PriceForOvernight { get; set; }
        public int Seats { get; set; }
        public string Status { get; set; } = "Available";
        public string? ImageUrl1 { get; set; }
        public string? ImageUrl2 { get; set; }

        // Optional uploaded files (multipart/form-data)
        public IFormFile? ImageFile1 { get; set; }
        public IFormFile? ImageFile2 { get; set; }
    }
}
