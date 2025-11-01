using OpenQA.Selenium;
using Xunit;

namespace Sherine.Tests.UITests;

[Collection("UI Tests")]
public class HomePageTests
{
    private readonly WebDriverFixture _fixture;

    public HomePageTests(WebDriverFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public void HomePage_LoadsSuccessfully()
    {
        _fixture.Driver.Navigate().GoToUrl("http://localhost:3000");

        // Check for the presence of a key element on the homepage
        var element = _fixture.Driver.FindElement(By.TagName("h1"));
        Assert.Equal("Sherine Travels", element.Text);
    }
}
