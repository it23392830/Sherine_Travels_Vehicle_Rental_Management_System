using Sherine.Api.Models;
using Xunit;

namespace Sherine.Tests.Models
{
    public class VehicleTests
    {
        [Fact]
        public void Vehicle_DefaultValues_AreCorrect()
        {
            // Arrange & Act
            var vehicle = new Vehicle();

            // Assert
            Assert.Equal(string.Empty, vehicle.Type);
            Assert.Equal(0, vehicle.PriceWithDriver);
            Assert.Equal(0, vehicle.PriceWithoutDriver);
            Assert.Equal(0, vehicle.Seats);
            Assert.Equal("Available", vehicle.Status);
        }

        [Fact]
        public void Vehicle_Properties_CanBeSet()
        {
            // Arrange
            var vehicle = new Vehicle();

            // Act
            vehicle.Type = "SUV";
            vehicle.PriceWithDriver = 6000;
            vehicle.PriceWithoutDriver = 4000;
            vehicle.Seats = 6;
            vehicle.Status = "Booked";

            // Assert
            Assert.Equal("SUV", vehicle.Type);
            Assert.Equal(6000, vehicle.PriceWithDriver);
            Assert.Equal(4000, vehicle.PriceWithoutDriver);
            Assert.Equal(6, vehicle.Seats);
            Assert.Equal("Booked", vehicle.Status);
        }

        [Theory]
        [InlineData("Available")]
        [InlineData("Booked")]
        [InlineData("Maintenance")]
        public void Vehicle_Status_AcceptsValidValues(string status)
        {
            // Arrange
            var vehicle = new Vehicle();

            // Act
            vehicle.Status = status;

            // Assert
            Assert.Equal(status, vehicle.Status);
        }

        [Theory]
        [InlineData(1)]
        [InlineData(2)]
        [InlineData(4)]
        [InlineData(6)]
        [InlineData(8)]
        public void Vehicle_Seats_AcceptsValidValues(int seats)
        {
            // Arrange
            var vehicle = new Vehicle();

            // Act
            vehicle.Seats = seats;

            // Assert
            Assert.Equal(seats, vehicle.Seats);
        }

        [Theory]
        [InlineData(0)]
        [InlineData(1000)]
        [InlineData(5000)]
        [InlineData(10000)]
        public void Vehicle_Price_AcceptsValidValues(decimal price)
        {
            // Arrange
            var vehicle = new Vehicle();

            // Act
            vehicle.PriceWithDriver = price;
            vehicle.PriceWithoutDriver = price;

            // Assert
            Assert.Equal(price, vehicle.PriceWithDriver);
            Assert.Equal(price, vehicle.PriceWithoutDriver);
        }
    }
}
