using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sherine.Api.Data;
using Sherine.Api.Models;

namespace Sherine.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Manager,Owner")] // Managers/Owners can view driver info, but not add/delete
    public class DriverController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public DriverController(ApplicationDbContext db)
        {
            _db = db;
        }

        // ✅ GET: api/Driver
        // Used for listing all drivers (still needed for manager dashboard)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAll()
        {
            var items = await _db.Drivers
                .Include(d => d.Vehicle)
                .AsNoTracking()
                .Select(d => new
                {
                    d.Id,
                    d.Name,
                    d.LicenseNumber,
                    d.Contact,
                    d.Status,
                    d.VehicleId,
                    Vehicle = d.Vehicle != null
                        ? new { d.Vehicle.Id, d.Vehicle.Number, d.Vehicle.Type }
                        : null
                })
                .ToListAsync();

            return Ok(items);
        }

        // ❌ POST: api/Driver — Disabled
        [HttpPost]
        public IActionResult Create([FromBody] Driver driver)
        {
            return BadRequest(new
            {
                message = "Manual driver creation is disabled. Drivers must register via the signup page."
            });
        }

        // ❌ PUT: api/Driver/{id} — Disabled
        [HttpPut("{id:int}")]
        public IActionResult Update(int id, [FromBody] Driver driver)
        {
            return BadRequest(new
            {
                message = "Driver updates (license, contact, etc.) are not allowed here. Drivers manage their own profiles."
            });
        }

        // ❌ DELETE: api/Driver/{id} — Disabled
        [HttpDelete("{id:int}")]
        public IActionResult Delete(int id)
        {
            return BadRequest(new
            {
                message = "Driver deletion is restricted. Contact system admin if necessary."
            });
        }
    }
}
