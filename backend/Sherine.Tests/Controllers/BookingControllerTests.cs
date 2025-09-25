using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
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
    public class BookingControllerTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly BookingController _controller;
        private readonly ServiceProvider _serviceProvider;

        public BookingControllerTests()
        {
            // Setup in-memory database
            var services = new ServiceCollection();
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()));
            
            _serviceProvider = services.BuildServiceProvider();
            _context = _serviceProvider.GetRequiredService<ApplicationDbContext>();
            
            // Initialize database
            _context.Database.EnsureCreated();
            
            // Create controller and set a fake user identity on ControllerContext
            _controller = new BookingController(_context, null);
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new System.Security.Claims.ClaimsPrincipal(
                        new System.Security.Claims.ClaimsIdentity(new[]
                        {
                            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.NameIdentifier, "test-user-id"),
                            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, "testuser@example.com")
                        }, "TestAuth"))
                }
            };
        }

        [Fact]
        public async Task CreateBooking_ValidData_ReturnsBookingResponse()
        {
            // Arrange
            var vehicle = new Vehicle
            {
                Type = "Sedan",
                PriceWithDriver = 5000,
                PriceWithoutDriver = 3000,
                Seats = 4,
                Status = "Available"
            };
            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            var bookingDto = new CreateBookingDto
            {
                StartDate = DateTime.Today.AddDays(1),
                EndDate = DateTime.Today.AddDays(3),
                Kilometers = 100,
                WithDriver = true
            };

            // Act
            var result = await _controller.CreateBooking(bookingDto);

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result.Result);
            var okResult = result.Result as OkObjectResult;
            var bookingResponse = okResult!.Value as BookingResponseDto;
            Assert.NotNull(bookingResponse);
            Assert.Equal("BK000001", bookingResponse.BookingId);
            Assert.Equal(100, bookingResponse.Kilometers);
            Assert.True(bookingResponse.WithDriver);
            Assert.Equal("Pending", bookingResponse.Status);
            Assert.Equal("Sedan", bookingResponse.VehicleType);
        }

        [Fact]
        public async Task CreateBooking_NoAvailableVehicles_ReturnsBadRequest()
        {
            // Arrange
            var bookingDto = new CreateBookingDto
            {
                StartDate = DateTime.Today.AddDays(1),
                EndDate = DateTime.Today.AddDays(3),
                Kilometers = 100,
                WithDriver = true
            };

            // Act
            var result = await _controller.CreateBooking(bookingDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
            var badRequestResult = result.Result as BadRequestObjectResult;
            Assert.Contains("No vehicles available", badRequestResult!.Value!.ToString());
        }

        [Fact]
        public async Task CreateBooking_CalculatesPriceCorrectly()
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

            var bookingDto = new CreateBookingDto
            {
                StartDate = DateTime.Today.AddDays(1),
                EndDate = DateTime.Today.AddDays(2), // 2 days
                Kilometers = 50,
                WithDriver = true
            };

            // Act
            var result = await _controller.CreateBooking(bookingDto);

            // Assert
            Assert.IsType<OkObjectResult>(result.Result);
            var okResult = result.Result as OkObjectResult;
            var bookingResponse = okResult!.Value as BookingResponseDto;
            
            // Expected: (6000 * 2 days) + (50 * 0.5) = 12000 + 25 = 12025
            var expectedPrice = (6000m * 2) + (50 * 0.5m);
            Assert.Equal(expectedPrice, bookingResponse.TotalPrice);
        }

        [Fact]
        public async Task CreateBooking_UpdatesVehicleStatus()
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

            var bookingDto = new CreateBookingDto
            {
                StartDate = DateTime.Today.AddDays(1),
                EndDate = DateTime.Today.AddDays(2),
                Kilometers = 75,
                WithDriver = false
            };

            // Act
            await _controller.CreateBooking(bookingDto);

            // Assert
            var updatedVehicle = await _context.Vehicles.FindAsync(vehicle.Id);
            Assert.Equal("Booked", updatedVehicle.Status);
        }

        [Fact]
        public async Task GetUserBookings_ReturnsUserBookings()
        {
            // Arrange
            var vehicle = new Vehicle
            {
                Type = "Sedan",
                PriceWithDriver = 5000,
                PriceWithoutDriver = 3000,
                Seats = 4,
                Status = "Available"
            };
            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            var booking = new Booking
            {
                UserId = "test-user-id",
                VehicleId = vehicle.Id,
                StartDate = DateTime.Today.AddDays(1),
                EndDate = DateTime.Today.AddDays(3),
                Kilometers = 100,
                WithDriver = true,
                TotalPrice = 10050,
                Status = "Pending"
            };
            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetUserBookings();

            // Assert
            Assert.IsType<OkObjectResult>(result.Result);
            var okResult = result.Result as OkObjectResult;
            var bookings = okResult!.Value as IEnumerable<BookingResponseDto>;
            Assert.NotNull(bookings);
            Assert.Single(bookings!);
        }

        public void Dispose()
        {
            _context?.Dispose();
            _serviceProvider?.Dispose();
        }
    }
}
