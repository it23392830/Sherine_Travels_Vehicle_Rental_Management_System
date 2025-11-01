using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using Xunit;
using Xunit.Abstractions;

namespace Sherine.Tests.UITests;

[Collection("UI Tests")]
public class ManagerTests : UITestBase
{
    public ManagerTests(WebDriverFixture fixture, ITestOutputHelper output) : base(fixture, output)
    {
    }

}
