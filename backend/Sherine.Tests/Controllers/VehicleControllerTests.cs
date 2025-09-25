using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Sherine.Api.Controllers;
using Sherine.Api.Data;
using Sherine.Api.DTOs;
using Sherine.Api.Models;
using System;
using System.Threading.Tasks;
using Xunit;

namespace Sherine.Tests.Controllers
{
    public class VehicleControllerTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly VehicleController _controller;
        private readonly ServiceProvider _serviceProvider;

        public VehicleControllerTests()
        {
            // Setup in-memory database
            var services = new ServiceCollection();
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()));
            
            _serviceProvider = services.BuildServiceProvider();
            _context = _serviceProvider.GetRequiredService<ApplicationDbContext>();
            
            // Initialize database
            _context.Database.EnsureCreated();
            
            // Create controller
            _controller = new VehicleController(_context);
        }

        [Fact]
        public async Task GetAllVehicles_ReturnsEmptyList_WhenNoVehicles()
        {
            // Act
            var result = await _controller.GetAllVehicles();

            // Assert
            Assert.IsType<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            var vehicles = okResult.Value as List<Vehicle>;
            Assert.Empty(vehicles);
        }

        [Fact]
        public async Task AddVehicle_ValidData_ReturnsCreatedVehicle()
        {
            // Arrange
            var vehicleDto = new VehicleDto
            {
                Type = "Sedan",
                PriceWithDriver = 5000,
                PriceWithoutDriver = 3000,
                Seats = 4,
                Status = "Available"
            };

            // Act
            var result = await _controller.AddVehicle(vehicleDto);

            // Assert
            Assert.IsType<CreatedAtActionResult>(result);
            var createdResult = result as CreatedAtActionResult;
            var vehicle = createdResult.Value as Vehicle;
            Assert.Equal("Sedan", vehicle.Type);
            Assert.Equal(5000, vehicle.PriceWithDriver);
            Assert.Equal(3000, vehicle.PriceWithoutDriver);
            Assert.Equal(4, vehicle.Seats);
            Assert.Equal("Available", vehicle.Status);
        }

        [Fact]
        public async Task GetVehicle_ExistingId_ReturnsVehicle()
        {
            // Arrange
            var vehicle = new Vehicle
            {
                Type = "SUV",
                PriceWithDriver = 6000,
                PriceWithoutDriver = 4000,
                Seats = 6,
                Status = "Available"
            };
            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetVehicle(vehicle.Id);

            // Assert
            Assert.IsType<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            var returnedVehicle = okResult.Value as Vehicle;
            Assert.Equal(vehicle.Id, returnedVehicle.Id);
            Assert.Equal("SUV", returnedVehicle.Type);
        }

        [Fact]
        public async Task GetVehicle_NonExistingId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetVehicle(999);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task UpdateVehicle_ValidData_ReturnsUpdatedVehicle()
        {
            // Arrange
            var vehicle = new Vehicle
            {
                Type = "Hatchback",
                PriceWithDriver = 4000,
                PriceWithoutDriver = 2500,
                Seats = 4,
                Status = "Available"
            };
            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            var updateDto = new VehicleDto
            {
                Type = "Hatchback",
                PriceWithDriver = 4500,
                PriceWithoutDriver = 2500,
                Seats = 4,
                Status = "Booked"
            };

            // Act
            var result = await _controller.UpdateVehicle(vehicle.Id, updateDto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            var updatedVehicle = okResult.Value as Vehicle;
            Assert.Equal(4500, updatedVehicle.PriceWithDriver);
            Assert.Equal("Booked", updatedVehicle.Status);
        }

        [Fact]
        public async Task DeleteVehicle_ExistingId_ReturnsNoContent()
        {
            // Arrange
            var vehicle = new Vehicle
            {
                Type = "Convertible",
                PriceWithDriver = 7000,
                PriceWithoutDriver = 5000,
                Seats = 2,
                Status = "Available"
            };
            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.DeleteVehicle(vehicle.Id);

            // Assert
            Assert.IsType<NoContentResult>(result);
            
            // Verify vehicle is deleted
            var deletedVehicle = await _context.Vehicles.FindAsync(vehicle.Id);
            Assert.Null(deletedVehicle);
        }

        [Fact]
        public async Task DeleteVehicle_NonExistingId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.DeleteVehicle(999);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        public void Dispose()
        {
            _context?.Dispose();
            _serviceProvider?.Dispose();
        }
    }
}
