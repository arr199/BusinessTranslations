using System.Net;
using System.Text.Json;
using Business.Translations.IntegrationTests.Factories;
using FluentAssertions;

namespace Business.Translations.IntegrationTests.Translations;

// Own fixture (fresh database) so seed data cannot pre-exist from other tests.
public class CreateTablesSeederTests : IClassFixture<TranslationsApiFactory>
{
    private readonly HttpClient _client;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public CreateTablesSeederTests(TranslationsApiFactory factory)
    {
        _client = factory.Client;
    }

    [Fact]
    public async Task CreateTables_WithCollidingSeedNames_Succeeds()
    {
        // Tables + DEBUG seed data first
        var firstRun = await _client.PostAsync("/bt/createTables", null);
        firstRun.StatusCode.Should().Be(HttpStatusCode.OK);

        // Simulate a user's pre-existing data carrying the seeder's sample names
        // but API-generated slugs/codes (e.g. Name="Authentication", Slug="authentication")
        var modulesBody = await (await _client.GetAsync("/bt/modules")).Content.ReadAsStringAsync();
        var modules = JsonSerializer.Deserialize<ListResponse>(modulesBody, JsonOptions)!;
        var authModule = modules
            .Data!.Value.EnumerateArray()
            .Single(m => m.GetProperty("name").GetString() == "Authentication");
        var moduleDelete = await _client.DeleteAsync(
            $"/bt/modules/{authModule.GetProperty("id").GetInt32()}"
        );
        moduleDelete.StatusCode.Should().Be(HttpStatusCode.OK);

        var languagesBody = await (
            await _client.GetAsync("/bt/languages")
        ).Content.ReadAsStringAsync();
        var languages = JsonSerializer.Deserialize<ListResponse>(languagesBody, JsonOptions)!;
        var englishLanguage = languages
            .Data!.Value.EnumerateArray()
            .Single(l => l.GetProperty("name").GetString() == "English");
        var languageDelete = await _client.DeleteAsync(
            $"/bt/languages/{englishLanguage.GetProperty("id").GetInt32()}"
        );
        languageDelete.StatusCode.Should().Be(HttpStatusCode.OK);

        // Recreate the user's data through the API (different slug/code, same names)
        var moduleCreate = await _client.PostAsJsonAsync(
            "/bt/modules",
            new { name = "Authentication" }
        );
        moduleCreate.StatusCode.Should().Be(HttpStatusCode.Created);
        var languageCreate = await _client.PostAsJsonAsync(
            "/bt/languages",
            new { code = "enx", name = "English" }
        );
        languageCreate.StatusCode.Should().Be(HttpStatusCode.Created);

        // createTables must not fail on the name collisions
        var response = await _client.PostAsync("/bt/createTables", null);
        var bodyText = await response.Content.ReadAsStringAsync();
        var body = JsonSerializer.Deserialize<SimpleResponse>(bodyText, JsonOptions)!;
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        body.Success.Should().BeTrue();

        // Seeded translations must resolve to real rows, not NULL foreign keys
        var translations = await _client.GetAsync("/bt/translations?keywords=login.title");
        var content = await translations.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<TranslationsResponse>(content, JsonOptions)!;
        result.Data.Should().NotBeNull();
        result.Data!.Value.EnumerateArray().Should().NotBeEmpty();
    }

    private class SimpleResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
    }

    private class ListResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public JsonElement? Data { get; set; }
    }

    private class TranslationsResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public JsonElement? Data { get; set; }
        public int TotalCount { get; set; }
    }
}
