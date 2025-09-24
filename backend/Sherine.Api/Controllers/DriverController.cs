using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sherine.Api.Data;
using Sherine.Api.Models;

namespace Sherine.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Manager,Owner")] // Only Manager/Owner manage drivers
    public class DriverController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public DriverController(ApplicationDbContext db)
        {
            _db = db;
        }

        // GET: api/Driver
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAll()
        {
            var items = await _db.Drivers
                .AsNoTracking()
                .Select(d => new
                {
                    d.Id,
                    name = d.Name,
                    licenseNumber = d.LicenseNumber,
                    contact = d.Contact,
                    status = d.Status,
                    vehicleId = d.VehicleId
                })
                .ToListAsync();

            return Ok(items);
        }

        // POST: api/Driver
        [HttpPost]
        public async Task<ActionResult<object>> Create([FromBody] Driver driver)
        {
            // Validate vehicle availability if assigning
            if (driver.VehicleId.HasValue)
            {
                var vehicle = await _db.Vehicles.AsNoTracking().FirstOrDefaultAsync(v => v.Id == driver.VehicleId.Value);
                if (vehicle == null) return BadRequest(new { message = "Vehicle not found" });
                if (!string.Equals(vehicle.Status, "Available", StringComparison.OrdinalIgnoreCase))
                    return BadRequest(new { message = "Vehicle is not available" });

                var alreadyAssigned = await _db.Drivers.AnyAsync(d => d.VehicleId == driver.VehicleId.Value);
                if (alreadyAssigned) return BadRequest(new { message = "Vehicle already has a driver" });
            }
            _db.Drivers.Add(driver);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                driver.Id,
                name = driver.Name,
                licenseNumber = driver.LicenseNumber,
                contact = driver.Contact,
                status = driver.Status,
                vehicleId = driver.VehicleId
            });
        }

        // PUT: api/Driver/{id}
        [HttpPut("{id:int}")]
        public async Task<ActionResult<object>> Update(int id, [FromBody] Driver input)
        {
            var existing = await _db.Drivers.FindAsync(id);
            if (existing == null) return NotFound();

            // Validate vehicle availability on reassignment
            if (input.VehicleId.HasValue)
            {
                var vehicle = await _db.Vehicles.AsNoTracking().FirstOrDefaultAsync(v => v.Id == input.VehicleId.Value);
                if (vehicle == null) return BadRequest(new { message = "Vehicle not found" });
                if (!string.Equals(vehicle.Status, "Available", StringComparison.OrdinalIgnoreCase))
                    return BadRequest(new { message = "Vehicle is not available" });

                var assignedToOther = await _db.Drivers.AnyAsync(d => d.VehicleId == input.VehicleId.Value && d.Id != id);
                if (assignedToOther) return BadRequest(new { message = "Vehicle already has a driver" });
            }

            existing.Name = input.Name;
            existing.LicenseNumber = input.LicenseNumber;
            existing.Contact = input.Contact;
            existing.Status = input.Status;
            existing.VehicleId = input.VehicleId;

            await _db.SaveChangesAsync();

            return Ok(new
            {
                existing.Id,
                name = existing.Name,
                licenseNumber = existing.LicenseNumber,
                contact = existing.Contact,
                status = existing.Status,
                vehicleId = existing.VehicleId
            });
        }

        // DELETE: api/Driver/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _db.Drivers.FindAsync(id);
            if (existing == null) return NotFound();

            _db.Drivers.Remove(existing);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}


