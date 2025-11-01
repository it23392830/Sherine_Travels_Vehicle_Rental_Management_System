using Xunit.Abstractions;

namespace Sherine.Tests.UITests;

[Collection("UI Tests")]
public abstract class UITestBase
{
    protected readonly WebDriverFixture _fixture;
    protected readonly ITestOutputHelper _output;

    protected UITestBase(WebDriverFixture fixture, ITestOutputHelper output)
    {
        _fixture = fixture;
        _output = output;
        _fixture.Reset();
    }
}
