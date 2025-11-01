using OpenQA.Selenium;
using Microsoft.Extensions.Configuration;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;

namespace Sherine.Tests.UITests;

public class WebDriverFixture : IDisposable
{
    public IWebDriver Driver { get; }
    public UITestSettings Settings { get; }

    public WebDriverFixture()
    {
        // The path to the ChromeDriver executable
        // Make sure you have downloaded the correct version of ChromeDriver for your browser
        // and placed it in a known location.
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json")
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        Settings = configuration.GetSection("UiTests").Get<UITestSettings>();

        var solutionDir = Directory.GetParent(Directory.GetCurrentDirectory()).Parent.Parent.Parent.Parent.FullName;
        var driverPath = Path.Combine(solutionDir, "chromedriver.exe");

        Driver = new ChromeDriver(Path.GetDirectoryName(driverPath));
    }

    public IWebElement WaitForElement(By locator, int seconds = 30)
    {
        var wait = new WebDriverWait(Driver, TimeSpan.FromSeconds(seconds));
        return wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementToBeClickable(locator));
    }

    public IWebElement WaitForElementVisible(By locator, int seconds = 30)
    {
        var wait = new WebDriverWait(Driver, TimeSpan.FromSeconds(seconds));
        return wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementIsVisible(locator));
    }

    public void Login(string userType)
    {
        Driver.Navigate().GoToUrl(Settings.BaseUrl);
        var emailField = WaitForElement(By.CssSelector("[data-testid='email-input']"));
        var passwordField = WaitForElement(By.CssSelector("[data-testid='password-input']"));
        var loginButton = WaitForElement(By.CssSelector("[data-testid='submit-button']"));

        var user = Settings.Users[userType];
        emailField.SendKeys(user.Email);
        passwordField.SendKeys(user.Password);
        loginButton.Click();

        var wait = new WebDriverWait(Driver, TimeSpan.FromSeconds(30));
        if (userType == "Manager" || userType == "Owner")
        {
            wait.Until(d => d.Url.Contains("/dashboard/manager"));
        }
        else
        {
            wait.Until(d => d.Url.Contains("/dashboard/user"));
        }
    }

    public void CreateVehicle(string vehicleType, string vehicleNumber)
    {
        Driver.Navigate().GoToUrl($"{Settings.BaseUrl}/dashboard/manager/addvehicle");
        WaitForElement(By.CssSelector("[data-testid='vehicle-type-input']")).SendKeys(vehicleType);
        WaitForElement(By.CssSelector("[data-testid='vehicle-number-input']")).SendKeys(vehicleNumber);
        WaitForElement(By.CssSelector("[data-testid='seats-input']")).SendKeys("4");
        WaitForElement(By.CssSelector("[data-testid='price-per-km-without-driver-input']")).SendKeys("100");
        WaitForElement(By.CssSelector("[data-testid='price-per-km-with-driver-input']")).SendKeys("120");
        WaitForElement(By.CssSelector("[data-testid='price-for-overnight-input']")).SendKeys("2500");
        WaitForElement(By.CssSelector("[data-testid='add-update-vehicle-button']")).Click();
        WaitForElementVisible(By.CssSelector("[data-testid='success-message']"), 15);
    }

    public void Reset()
    {
        Driver.Manage().Cookies.DeleteAllCookies();
        Driver.Navigate().GoToUrl(Settings.BaseUrl);
    }

    public void Dispose()
    {   
        Driver.Quit();
        Driver.Dispose();
        GC.SuppressFinalize(this);
    }
}
