namespace Sherine.Api.DTOs
{
    public class VehicleDto
    {
        public string Type { get; set; }
        public decimal PriceWithDriver { get; set; }
        public decimal PriceWithoutDriver { get; set; }
        public int Seats { get; set; }
        public string Status { get; set; }
    }
}
