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
    public class AuthControllerTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly AuthController _controller;
        private readonly ServiceProvider _serviceProvider;

        public AuthControllerTests()
        {
            // Setup in-memory database
            var services = new ServiceCollection();
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()));
            
            _serviceProvider = services.BuildServiceProvider();
            _context = _serviceProvider.GetRequiredService<ApplicationDbContext>();
            
            // Initialize database
            _context.Database.EnsureCreated();
            
            // Create controller (simplified for testing)
            _controller = new AuthController(null, null, null);
        }

        [Fact]
        public async Task Register_ValidUser_ReturnsSuccess()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Email = "test@example.com",
                Password = "Test@123",
                FullName = "Test User"
            };

            // Act
            var result = await _controller.Register(registerDto, "User");

            // Assert
            Assert.IsType<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            Assert.Contains("Account created as User", okResult.Value.ToString());
        }

        [Fact]
        public async Task Register_DuplicateEmail_ReturnsBadRequest()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Email = "duplicate@example.com",
                Password = "Test@123",
                FullName = "Test User"
            };

            // Act
            await _controller.Register(registerDto, "User");
            var result = await _controller.Register(registerDto, "User");

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Register_InvalidRole_DefaultsToUser()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Email = "test2@example.com",
                Password = "Test@123",
                FullName = "Test User"
            };

            // Act
            var result = await _controller.Register(registerDto, "InvalidRole");

            // Assert
            Assert.IsType<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            Assert.Contains("Account created as User", okResult.Value.ToString());
        }

        public void Dispose()
        {
            _context?.Dispose();
            _serviceProvider?.Dispose();
        }
    }
}
