using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using Xunit;

namespace Sherine.Tests.UITests;

[Collection("UI Tests")]
public class ManagerTests
{
    private readonly WebDriverFixture _fixture;

    public ManagerTests(WebDriverFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public void Manager_Can_Add_Edit_And_Delete_Vehicle()
    {
        // 1. Login as a manager
        _fixture.Login("Manager");

        // 2. Wait for the dashboard to load by checking for the header
        System.Threading.Thread.Sleep(5000);
        var wait = new WebDriverWait(_fixture.Driver, TimeSpan.FromSeconds(30));
        var dashboardHeader = wait.Until(d => d.FindElement(By.CssSelector("[data-testid='manager-dashboard-header']")));
        Assert.Equal("Manager Dashboard", dashboardHeader.Text);

        // 3. Add a new vehicle
        var vehicleType = "Test Car";
        var vehicleNumber = $"T{DateTime.Now.Ticks}";
        _fixture.CreateVehicle(vehicleType, vehicleNumber);

        // 5. Edit the vehicle
        var vehicleCard = _fixture.Driver.FindElement(By.XPath($"//h3[text()='{vehicleType}']"));
        var editButton = vehicleCard.FindElement(By.XPath("../../..//button[1]"));
        editButton.Click();
        var updatedVehicleType = "Updated Test Car";
        _fixture.WaitForElement(By.CssSelector("[data-testid='vehicle-type-input']")).Clear();
        _fixture.WaitForElement(By.CssSelector("[data-testid='vehicle-type-input']")).SendKeys(updatedVehicleType);
        _fixture.WaitForElement(By.CssSelector("[data-testid='add-update-vehicle-button']")).Click();
        var successMessage = _fixture.WaitForElementVisible(By.CssSelector("[data-testid='success-message']"), 15);
        Assert.Contains("Vehicle updated successfully!", successMessage.Text);

        // 6. Delete the vehicle
        vehicleCard = _fixture.Driver.FindElement(By.XPath($"//h3[text()='{updatedVehicleType}']"));
        var deleteButton = vehicleCard.FindElement(By.XPath("../../..//button[2]"));
        deleteButton.Click();

        // Verify the vehicle is no longer in the list
        _fixture.Driver.Navigate().Refresh();
        wait.Until(d => d.FindElements(By.XPath($"//h3[text()='{updatedVehicleType}']")).Count == 0);
        Assert.Throws<NoSuchElementException>(() => _fixture.Driver.FindElement(By.XPath($"//h3[text()='{updatedVehicleType}']")));
    }
}
