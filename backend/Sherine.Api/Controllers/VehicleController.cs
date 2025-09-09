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
    [Authorize(Roles = "Manager")] // ✅ Only Manager can access
    public class VehicleController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VehicleController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/vehicle
        [HttpGet]
        public async Task<IActionResult> GetAllVehicles()
        {
            var vehicles = await _context.Vehicles.ToListAsync();
            return Ok(vehicles);
        }

        // GET: api/vehicle/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetVehicle(int id)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null) return NotFound();
            return Ok(vehicle);
        }

        // POST: api/vehicle
        [HttpPost]
        public async Task<IActionResult> AddVehicle([FromBody] VehicleDto dto)
        {
            var vehicle = new Vehicle
            {
                Type = dto.Type,
                Price = dto.Price,
                Status = dto.Status
            };
            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetVehicle), new { id = vehicle.Id }, vehicle);
        }

        // PUT: api/vehicle/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVehicle(int id, [FromBody] VehicleDto dto)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null) return NotFound();

            vehicle.Type = dto.Type;
            vehicle.Price = dto.Price;
            vehicle.Status = dto.Status;

            await _context.SaveChangesAsync();
            return Ok(vehicle);
        }

        // DELETE: api/vehicle/5
        [HttpDelete("{id}")]
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
