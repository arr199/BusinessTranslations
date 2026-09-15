using System.Net;
using System.Text.Json;
using Business.Translations.IntegrationTests.Factories;
using FluentAssertions;

namespace Business.Translations.IntegrationTests.Translations;

public class BulkTranslationsEndpointTests : IClassFixture<TranslationsApiFactory>
{
    private readonly HttpClient _client;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public BulkTranslationsEndpointTests(TranslationsApiFactory factory)
    {
        _client = factory.Client;
    }

    [Fact]
    public async Task Bulk_Creates_Updates_And_Skips_With_Reasons()
    {
        await EnsureTables();
        var (moduleId, languageId, moduleName, languageCode) = await SeedModuleAndLanguage();

        // Pre-existing translation that should be UPDATED by the bulk import
        var createResponse = await _client.PostAsJsonAsync(
            "/bt/translations",
            new
            {
                moduleId,
                languageId,
                keyName = "greet",
                value = "Hello",
            }
        );
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var rows = new
        {
            rows = new object[]
            {
                // Same key → upsert (updated)
                new { module = moduleName, keyName = "greet", languageCode = LanguageCode, value = "Hola" },
                // New key → created
                new { module = moduleName, keyName = "farewell", languageCode = LanguageCode, value = "Goodbye" },
                // Unknown module → skipped with reason
                new { module = "Nope_Module", keyName = "k1", languageCode = LanguageCode, value = "v" },
            },
        };

        var response = await _client.PostAsJsonAsync("/bt/translations/bulk", rows);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadAsStringAsync();
        var summary = JsonSerializer.Deserialize<BulkResponse>(body, JsonOptions)!;
        summary.Success.Should().BeTrue();
        summary.Data.Should().NotBeNull();
        summary.Data!.Created.Should().Be(1);
        summary.Data.Updated.Should().Be(1);
        summary.Data.Skipped.Should().HaveCount(1);
        summary.Data.Skipped[0].Key.Should().Be("k1");
        summary.Data.Skipped[0].Reason.Should().Contain("Nope_Module");
        summary.Data.Failed.Should().BeEmpty();

        // The upsert must have overwritten the stored value
        var listBody = await (await _client.GetAsync("/bt/translations?keywords=greet")).Content.ReadAsStringAsync();
        var list = JsonSerializer.Deserialize<TranslationsResponse>(listBody, JsonOptions)!;
        list.Success.Should().BeTrue();
        var item = list.Data!.Value.EnumerateArray().First();
        item.GetProperty("value").GetString().Should().Be("Hola");
    }

    [Fact]
    public async Task Bulk_Trims_Row_Values_Before_Upsert()
    {
        await EnsureTables();
        var (moduleId, languageId, moduleName, _) = await SeedModuleAndLanguage();

        var rows = new
        {
            rows = new object[]
            {
                new
                {
                    module = $" {moduleName} ",
                    keyName = " padded.key ",
                    languageCode = $" {LanguageCode} ",
                    value = " Padded Value ",
                },
            },
        };

        var response = await _client.PostAsJsonAsync("/bt/translations/bulk", rows);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadAsStringAsync();
        var summary = JsonSerializer.Deserialize<BulkResponse>(body, JsonOptions)!;
        summary.Success.Should().BeTrue();
        summary.Data!.Created.Should().Be(1);
        summary.Data.Updated.Should().Be(0);
        summary.Data.Skipped.Should().BeEmpty();
        summary.Data.Failed.Should().BeEmpty();

        // Stored row must be trimmed
        var listBody = await (
            await _client.GetAsync("/bt/translations?keywords=padded.key")
        ).Content.ReadAsStringAsync();
        var list = JsonSerializer.Deserialize<TranslationsResponse>(listBody, JsonOptions)!;
        var item = list.Data!.Value.EnumerateArray().First();
        item.GetProperty("keyName").GetString().Should().Be("padded.key");
        item.GetProperty("value").GetString().Should().Be("Padded Value");

        // Suppress unused variable warnings — moduleId/languageId come from the seed helper
        _ = moduleId;
        _ = languageId;
    }

    [Fact]
    public async Task Bulk_Returns_400_When_Rows_Empty()
    {
        await EnsureTables();

        var response = await _client.PostAsJsonAsync(
            "/bt/translations/bulk",
            new { rows = Array.Empty<object>() }
        );
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Bulk_Returns_400_When_Too_Many_Rows()
    {
        await EnsureTables();

        var response = await _client.PostAsJsonAsync(
            "/bt/translations/bulk",
            new
            {
                rows = Enumerable.Range(0, 10001)
                    .Select(i => new { module = "m", keyName = $"k{i}", languageCode = "en", value = "v" }),
            }
        );
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // ─── Helpers ────────────────────────────────────────────────────

    private const string LanguageCode = "bl01";

    private async Task EnsureTables()
    {
        await _client.PostAsync("/bt/createTables", null);
    }

    private async Task<(int moduleId, int languageId, string moduleName, string languageCode)> SeedModuleAndLanguage()
    {
        var uniqueSuffix = Guid.NewGuid().ToString("N")[..8];

        await _client.PostAsJsonAsync(
            "/bt/modules",
            new { name = $"BulkMod_{uniqueSuffix}" }
        );
        await _client.PostAsJsonAsync(
            "/bt/languages",
            new { code = LanguageCode, name = $"BulkLang_{uniqueSuffix}" }
        );

        var modulesBody = await (await _client.GetAsync("/bt/modules")).Content.ReadAsStringAsync();
        var modules = JsonSerializer.Deserialize<DataResponse>(modulesBody, JsonOptions)!;
        var moduleId = modules.Data!.Value.EnumerateArray()
            .First(m => m.GetProperty("name").GetString() == $"BulkMod_{uniqueSuffix}")
            .GetProperty("id").GetInt32();

        var langsBody = await (await _client.GetAsync("/bt/languages")).Content.ReadAsStringAsync();
        var langs = JsonSerializer.Deserialize<DataResponse>(langsBody, JsonOptions)!;
        var languageId = langs.Data!.Value.EnumerateArray()
            .First(l => l.GetProperty("code").GetString() == LanguageCode)
            .GetProperty("id").GetInt32();

        return (moduleId, languageId, $"BulkMod_{uniqueSuffix}", LanguageCode);
    }

    private class BulkResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public BulkSummary? Data { get; set; }
    }

    private class BulkSummary
    {
        public int Created { get; set; }
        public int Updated { get; set; }
        public RowOutcome[] Skipped { get; set; } = [];
        public RowOutcome[] Failed { get; set; } = [];
    }

    private class RowOutcome
    {
        public string Key { get; set; } = "";
        public string Reason { get; set; } = "";
    }

    private class TranslationsResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public JsonElement? Data { get; set; }
        public int TotalCount { get; set; }
    }

    private class DataResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public JsonElement? Data { get; set; }
    }
}
