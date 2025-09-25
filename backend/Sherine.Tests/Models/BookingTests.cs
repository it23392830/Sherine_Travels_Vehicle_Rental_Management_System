using Sherine.Api.Models;
using System;
using Xunit;

namespace Sherine.Tests.Models
{
    public class BookingTests
    {
        [Fact]
        public void Booking_DefaultValues_AreCorrect()
        {
            // Arrange & Act
            var booking = new Booking();

            // Assert
            Assert.Equal(string.Empty, booking.UserId);
            Assert.Equal(0, booking.VehicleId);
            Assert.Equal(DateTime.MinValue, booking.StartDate);
            Assert.Equal(DateTime.MinValue, booking.EndDate);
            Assert.Equal(0, booking.Kilometers);
            Assert.False(booking.WithDriver);
            Assert.Equal(0, booking.TotalPrice);
            Assert.Equal("Pending", booking.Status);
            Assert.True(booking.CreatedAt <= DateTime.UtcNow);
        }

        [Fact]
        public void Booking_Properties_CanBeSet()
        {
            // Arrange
            var booking = new Booking();
            var startDate = DateTime.Today.AddDays(1);
            var endDate = DateTime.Today.AddDays(3);

            // Act
            booking.UserId = "user-123";
            booking.VehicleId = 1;
            booking.StartDate = startDate;
            booking.EndDate = endDate;
            booking.Kilometers = 100;
            booking.WithDriver = true;
            booking.TotalPrice = 10050;
            booking.Status = "Confirmed";

            // Assert
            Assert.Equal("user-123", booking.UserId);
            Assert.Equal(1, booking.VehicleId);
            Assert.Equal(startDate, booking.StartDate);
            Assert.Equal(endDate, booking.EndDate);
            Assert.Equal(100, booking.Kilometers);
            Assert.True(booking.WithDriver);
            Assert.Equal(10050, booking.TotalPrice);
            Assert.Equal("Confirmed", booking.Status);
        }

        [Theory]
        [InlineData("Pending")]
        [InlineData("Confirmed")]
        [InlineData("Cancelled")]
        [InlineData("Completed")]
        public void Booking_Status_AcceptsValidValues(string status)
        {
            // Arrange
            var booking = new Booking();

            // Act
            booking.Status = status;

            // Assert
            Assert.Equal(status, booking.Status);
        }

        [Fact]
        public void Booking_WithDriver_CanBeSet()
        {
            // Arrange
            var booking = new Booking();

            // Act
            booking.WithDriver = true;

            // Assert
            Assert.True(booking.WithDriver);
        }

        [Fact]
        public void Booking_WithoutDriver_CanBeSet()
        {
            // Arrange
            var booking = new Booking();

            // Act
            booking.WithDriver = false;

            // Assert
            Assert.False(booking.WithDriver);
        }

        [Theory]
        [InlineData(0)]
        [InlineData(50)]
        [InlineData(100)]
        [InlineData(500)]
        public void Booking_Kilometers_AcceptsValidValues(int kilometers)
        {
            // Arrange
            var booking = new Booking();

            // Act
            booking.Kilometers = kilometers;

            // Assert
            Assert.Equal(kilometers, booking.Kilometers);
        }

        [Fact]
        public void Booking_CreatedAt_IsSetAutomatically()
        {
            // Arrange
            var beforeCreation = DateTime.UtcNow;

            // Act
            var booking = new Booking();

            // Assert
            Assert.True(booking.CreatedAt >= beforeCreation);
            Assert.True(booking.CreatedAt <= DateTime.UtcNow);
        }
    }
}
