using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using Xunit;
using Xunit.Abstractions;

namespace Sherine.Tests.UITests;

[Collection("UI Tests")]
public class LoginTests : UITestBase
{
    public LoginTests(WebDriverFixture fixture, ITestOutputHelper output) : base(fixture, output)
    {
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
        wait.Until(d => d.Url.Contains("/dashboard"));
        Assert.Contains("/dashboard", _fixture.Driver.Url);
    }
}
