using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sherine.Api.Data;
using Sherine.Api.DTOs;
using Sherine.Api.Models;

namespace Sherine.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VehicleController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VehicleController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/vehicle (public - anyone can view available vehicles)
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllVehicles()
        {
            var vehicles = await _context.Vehicles.ToListAsync();
            return Ok(vehicles);
        }

        // GET: api/vehicle/5 (public)
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetVehicle(int id)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null) return NotFound();
            return Ok(vehicle);
        }

        // POST: api/vehicle
        [HttpPost]
        [Authorize(Roles = "Manager")] // Manager only
        [RequestSizeLimit(20_000_000)]
        public async Task<IActionResult> AddVehicle([FromForm] VehicleDto dto)
        {
            // handle optional file uploads
            string? saved1 = null;
            string? saved2 = null;
            if (dto.ImageFile1 != null && dto.ImageFile1.Length > 0)
            {
                var fileName = $"veh_{Guid.NewGuid()}_1{Path.GetExtension(dto.ImageFile1.FileName)}";
                var saveDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                Directory.CreateDirectory(saveDir);
                var path = Path.Combine(saveDir, fileName);
                using (var stream = new FileStream(path, FileMode.Create))
                {
                    await dto.ImageFile1.CopyToAsync(stream);
                }
                saved1 = $"/uploads/{fileName}";
            }
            if (dto.ImageFile2 != null && dto.ImageFile2.Length > 0)
            {
                var fileName = $"veh_{Guid.NewGuid()}_2{Path.GetExtension(dto.ImageFile2.FileName)}";
                var saveDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                Directory.CreateDirectory(saveDir);
                var path = Path.Combine(saveDir, fileName);
                using (var stream = new FileStream(path, FileMode.Create))
                {
                    await dto.ImageFile2.CopyToAsync(stream);
                }
                saved2 = $"/uploads/{fileName}";
            }

            var vehicle = new Vehicle
            {
                Type = dto.Type,
                Number = dto.Number,
                PriceWithDriver = dto.PriceWithDriver,
                PriceWithoutDriver = dto.PriceWithoutDriver,
                Seats = dto.Seats,
                Status = dto.Status,
                ImageUrl1 = saved1 ?? dto.ImageUrl1,
                ImageUrl2 = saved2 ?? dto.ImageUrl2
            };
            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetVehicle), new { id = vehicle.Id }, vehicle);
        }

        // PUT: api/vehicle/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Manager")] // Manager only
        [RequestSizeLimit(20_000_000)]
        public async Task<IActionResult> UpdateVehicle(int id, [FromForm] VehicleDto dto)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null) return NotFound();

            string? saved1 = null;
            string? saved2 = null;
            if (dto.ImageFile1 != null && dto.ImageFile1.Length > 0)
            {
                var fileName = $"veh_{Guid.NewGuid()}_1{Path.GetExtension(dto.ImageFile1.FileName)}";
                var saveDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                Directory.CreateDirectory(saveDir);
                var path = Path.Combine(saveDir, fileName);
                using (var stream = new FileStream(path, FileMode.Create))
                {
                    await dto.ImageFile1.CopyToAsync(stream);
                }
                saved1 = $"/uploads/{fileName}";
            }
            if (dto.ImageFile2 != null && dto.ImageFile2.Length > 0)
            {
                var fileName = $"veh_{Guid.NewGuid()}_2{Path.GetExtension(dto.ImageFile2.FileName)}";
                var saveDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                Directory.CreateDirectory(saveDir);
                var path = Path.Combine(saveDir, fileName);
                using (var stream = new FileStream(path, FileMode.Create))
                {
                    await dto.ImageFile2.CopyToAsync(stream);
                }
                saved2 = $"/uploads/{fileName}";
            }

            vehicle.Type = dto.Type;
            vehicle.Number = dto.Number;
            vehicle.PriceWithDriver = dto.PriceWithDriver;
            vehicle.PriceWithoutDriver = dto.PriceWithoutDriver;
            vehicle.Seats = dto.Seats;
            vehicle.Status = dto.Status;
            vehicle.ImageUrl1 = saved1 ?? dto.ImageUrl1 ?? vehicle.ImageUrl1;
            vehicle.ImageUrl2 = saved2 ?? dto.ImageUrl2 ?? vehicle.ImageUrl2;

            await _context.SaveChangesAsync();
            return Ok(vehicle);
        }

        // DELETE: api/vehicle/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Manager")] // Manager only
        public async Task<IActionResult> DeleteVehicle(int id)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null) return NotFound();

            _context.Vehicles.Remove(vehicle);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

