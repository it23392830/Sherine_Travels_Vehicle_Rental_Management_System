using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using Xunit;

namespace Sherine.Tests.UITests;

[Collection("UI Tests")]
public class LoginTests
{
    private readonly WebDriverFixture _fixture;

    public LoginTests(WebDriverFixture fixture)
    {
        _fixture = fixture;
    }

    [Theory]
    [InlineData("Manager")]
    [InlineData("Owner")]
    //[InlineData("Driver")]
    //[InlineData("Client")]
    public void Login_Successful(string role)
    {
        _fixture.Driver.Navigate().GoToUrl(_fixture.Settings.BaseUrl);

        var emailField = _fixture.WaitForElement(By.CssSelector("[data-testid='email-input']"));
        var passwordField = _fixture.WaitForElement(By.CssSelector("[data-testid='password-input']"));
        var loginButton = _fixture.WaitForElement(By.CssSelector("[data-testid='submit-button']"));

        var user = _fixture.Settings.Users[role];
        emailField.SendKeys(user.Email);
        passwordField.SendKeys(user.Password);
        loginButton.Click();

        var wait = new WebDriverWait(_fixture.Driver, TimeSpan.FromSeconds(10));
        var dashboardElement = role switch
        {
            "Manager" => wait.Until(d => d.FindElement(By.CssSelector("[data-testid='manager-dashboard-header']"))),
            "Owner" => wait.Until(d => d.FindElement(By.CssSelector("[data-testid='owner-dashboard-header']"))),
            "Driver" => wait.Until(d => d.FindElement(By.CssSelector("[data-testid='driver-dashboard-header']"))),
            "Client" => wait.Until(d => d.FindElement(By.CssSelector("[data-testid='client-dashboard-header']"))),
            _ => throw new ArgumentOutOfRangeException(nameof(role), role, null)
        };

        Assert.Contains("Dashboard", dashboardElement.Text);
    }
}
