using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Sherine.Api.Data;
using Sherine.Api.Models;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Xunit;

namespace Sherine.Tests.Integration
{
    public class BookingIntegrationTests : IClassFixture<WebApplicationFactory<Program>>, IDisposable
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;
        private readonly ApplicationDbContext _context;

        public BookingIntegrationTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Remove the existing DbContext
                    var descriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                    if (descriptor != null)
                        services.Remove(descriptor);

                    // Add in-memory database
                    services.AddDbContext<ApplicationDbContext>(options =>
                    {
                        options.UseInMemoryDatabase("TestDb");
                    });
                });
                builder.UseSetting(WebHostDefaults.EnvironmentKey, "Testing");
            });

            _client = _factory.CreateClient();
            _context = _factory.Services.GetRequiredService<ApplicationDbContext>();
        }

        [Fact]
        public async Task CreateBooking_WithValidData_ReturnsSuccess()
        {
            // Arrange
            await SeedTestData();
            var bookingData = new
            {
                startDate = DateTime.Today.AddDays(1).ToString("yyyy-MM-dd"),
                endDate = DateTime.Today.AddDays(3).ToString("yyyy-MM-dd"),
                kilometers = 100,
                withDriver = true
            };

            var json = JsonSerializer.Serialize(bookingData);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/Booking", content);

            // Assert
            Assert.True(response.IsSuccessStatusCode);
            var responseContent = await response.Content.ReadAsStringAsync();
            Assert.Contains("Booking created successfully", responseContent);
        }

        [Fact]
        public async Task CreateBooking_WithNoAvailableVehicles_ReturnsBadRequest()
        {
            // Arrange
            // Ensure no vehicles exist (isolate from other tests)
            _context.Bookings.RemoveRange(_context.Bookings);
            _context.Vehicles.RemoveRange(_context.Vehicles);
            await _context.SaveChangesAsync();
            // Don't seed any vehicles
            var bookingData = new
            {
                startDate = DateTime.Today.AddDays(1).ToString("yyyy-MM-dd"),
                endDate = DateTime.Today.AddDays(3).ToString("yyyy-MM-dd"),
                kilometers = 100,
                withDriver = true
            };

            var json = JsonSerializer.Serialize(bookingData);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/Booking", content);

            // Assert
            Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
            var responseContent = await response.Content.ReadAsStringAsync();
            Assert.Contains("No vehicles available", responseContent);
        }

        [Fact]
        public async Task GetUserBookings_ReturnsUserBookings()
        {
            // Arrange
            await SeedTestData();
            await SeedTestBooking();

            // Act
            var response = await _client.GetAsync("/api/Booking");

            // Assert
            Assert.True(response.IsSuccessStatusCode);
            var responseContent = await response.Content.ReadAsStringAsync();
            Assert.Contains("BK", responseContent);
        }

        private async Task SeedTestData()
        {
            var vehicle = new Vehicle
            {
                Type = "Test Sedan",
                PriceWithDriver = 5000,
                PriceWithoutDriver = 3000,
                Seats = 4,
                Status = "Available"
            };

            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();
        }

        private async Task SeedTestBooking()
        {
            var vehicle = await _context.Vehicles.FirstAsync();
            var booking = new Booking
            {
                UserId = "test-user",
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
        }

        public void Dispose()
        {
            _context?.Dispose();
            _client?.Dispose();
        }
    }
}
