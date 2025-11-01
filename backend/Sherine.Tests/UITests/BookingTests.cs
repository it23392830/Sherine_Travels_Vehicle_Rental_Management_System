using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using Xunit;

namespace Sherine.Tests.UITests;

[Collection("UI Tests")]
public class BookingTests
{
    private readonly WebDriverFixture _fixture;

    public BookingTests(WebDriverFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public void Client_Can_Book_Vehicle()
    {
        // 1. Login as a manager and create a vehicle
        _fixture.Login("Manager");
        var wait = new WebDriverWait(_fixture.Driver, TimeSpan.FromSeconds(30));
        var dashboardHeader = wait.Until(d => d.FindElement(By.CssSelector("[data-testid='manager-dashboard-header']")));
        Assert.Equal("Manager Dashboard", dashboardHeader.Text);
        _fixture.CreateVehicle("Test Car for Booking", $"B{DateTime.Now.Ticks}");

        // Logout
        _fixture.Driver.Navigate().GoToUrl($"{_fixture.Settings.BaseUrl}/logout");

        // 2. Login as a client
        _fixture.Login("Client");

        // 2. Wait for the dashboard to load
        var dashboardElement = wait.Until(d => d.FindElement(By.CssSelector("[data-testid='client-dashboard-header']")));
        Assert.Contains("Dashboard", dashboardElement.Text);

        // 3. Navigate directly to the vehicle booking page
        _fixture.Driver.Navigate().GoToUrl($"{_fixture.Settings.BaseUrl}/dashboard/user/vehicles?startDate={DateTime.Now.ToString("yyyy-MM-dd")}&endDate={DateTime.Now.AddDays(1).ToString("yyyy-MM-dd")}");

        // 5. Select a vehicle and navigate to the booking page
        var vehicleCard = wait.Until(d => d.FindElement(By.CssSelector("[data-testid^='vehicle-card-']")));
        var vehicleId = vehicleCard.GetAttribute("data-testid").Split('-').Last();
        _fixture.Driver.Navigate().GoToUrl($"{_fixture.Settings.BaseUrl}/dashboard/user/booking?vehicleId={vehicleId}&startDate={DateTime.Now.ToString("yyyy-MM-dd")}&endDate={DateTime.Now.AddDays(1).ToString("yyyy-MM-dd")}");

        // 6. Fill out booking details
        var kilometersInput = wait.Until(d => d.FindElement(By.CssSelector("[data-testid='kilometers-input']")));
        kilometersInput.SendKeys("100");

        var proceedToPaymentButton = _fixture.Driver.FindElement(By.CssSelector("[data-testid='proceed-to-payment-button']"));
        ((IJavaScriptExecutor)_fixture.Driver).ExecuteScript("arguments[0].click();", proceedToPaymentButton);

        // 7. Confirm payment
        var payAtPickupButton = wait.Until(d => d.FindElement(By.CssSelector("[data-testid='pay-at-pickup-button']")));
        payAtPickupButton.Click();

        var confirmPayAtPickupButton = wait.Until(d => d.FindElement(By.CssSelector("[data-testid='confirm-pay-at-pickup-button']")));
        confirmPayAtPickupButton.Click();

        // 8. Verify the booking was successful
        var alert = wait.Until(d => d.SwitchTo().Alert());
        Assert.Contains("Booking confirmed", alert.Text);
        alert.Accept();
    }
}
