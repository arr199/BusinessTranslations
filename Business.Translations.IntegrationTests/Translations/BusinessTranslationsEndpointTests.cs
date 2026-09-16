using System.Net;
using System.Text.RegularExpressions;
using Business.Translations.Endpoints;
using Business.Translations.IntegrationTests.Factories;
using FluentAssertions;

namespace Business.Translations.IntegrationTests.Translations;

public class BusinessTranslationsEndpointTests : IClassFixture<TranslationsApiFactory>
{
    private readonly HttpClient _client;

    public BusinessTranslationsEndpointTests(TranslationsApiFactory factory)
    {
        _client = factory.Client;
    }

    [Fact]
    public void Assembly_Embeds_Dashboard_Assets()
    {
        var assembly = typeof(
            Business.Translations.Endpoints.BusinessTranslationEndpointBuilder
        ).Assembly;

        var names = assembly.GetManifestResourceNames();

        names.Should().Contain(name =>
            name.StartsWith("Business.Translations.API.dist.")
            && name.EndsWith("index.html")
        );
        names.Should().Contain(name =>
            name.StartsWith("Business.Translations.API.dist.assets.")
            && (name.EndsWith(".js") || name.EndsWith(".css"))
        );
    }

    [Fact]
    public async Task Dashboard_Returns_Index_Html()
    {
        var response = await _client.GetAsync("/bt/dashboard");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var html = await response.Content.ReadAsStringAsync();
        html.Should().Contain("<div id=\"root\">");
    }

    [Fact]
    public async Task Dashboard_Asset_Returns_Content()
    {
        var html = await _client.GetStringAsync("/bt/dashboard");
        var assetMatch = Regex.Match(
            html,
            "/bt/dashboard/assets/index-[A-Za-z0-9_-]+\\.(js|css)"
        );
        assetMatch.Success.Should().BeTrue("index.html must reference bundled assets");

        var assetResponse = await _client.GetAsync(assetMatch.Value);
        assetResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        (await assetResponse.Content.ReadAsStringAsync()).Should().NotBeEmpty();
    }
}
