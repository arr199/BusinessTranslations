using System.Net;
using System.Text.Json;
using Business.Translations.IntegrationTests.Factories;
using FluentAssertions;

namespace Business.Translations.IntegrationTests.Translations;

public class TranslationsEndpointTests : IClassFixture<TranslationsApiFactory>
{
    private readonly HttpClient _client;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public TranslationsEndpointTests(TranslationsApiFactory factory)
    {
        _client = factory.Client;
    }

    // ─── Create Tables ──────────────────────────────────────────────

    [Fact]
    public async Task CreateTables_Returns_Success()
    {
        var response = await _client.PostAsync("/bt/createTables", null);
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await Deserialize(response);
        body.Success.Should().BeTrue();
    }

    // ─── Languages ──────────────────────────────────────────────────

    [Fact]
    public async Task Language_Crud_Lifecycle()
    {
        await EnsureTables();

        // Unique values so the DEBUG-seeded sample languages (en/es/fr) never collide
        var suffix = Guid.NewGuid().ToString("N")[..8];
        var code = suffix[..5];
        var name = $"English_{suffix}";

        // Create
        var createResponse = await _client.PostAsJsonAsync("/bt/languages", new { code, name });
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        // Get all
        var getResponse = await _client.GetAsync("/bt/languages");
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var getBody = await getResponse.Content.ReadAsStringAsync();
        var languages = JsonSerializer.Deserialize<DataResponse>(getBody, JsonOptions)!;
        languages.Success.Should().BeTrue();
        languages.Data.Should().NotBeNull();

        var created = languages
            .Data!.Value.EnumerateArray()
            .Single(l => l.GetProperty("code").GetString() == code);
        var languageId = created.GetProperty("id").GetInt32();

        // Update
        var updateResponse = await _client.PutAsJsonAsync(
            $"/bt/languages/{languageId}",
            new { code, name = $"English (US)_{suffix}" }
        );
        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Delete
        var deleteResponse = await _client.DeleteAsync($"/bt/languages/{languageId}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // ─── Modules ────────────────────────────────────────────────────

    [Fact]
    public async Task Module_Crud_Lifecycle()
    {
        await EnsureTables();

        // Create
        var createResponse = await _client.PostAsJsonAsync(
            "/bt/modules",
            new { name = "TestModule", icon = "test-icon" }
        );
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        // Get all
        var getResponse = await _client.GetAsync("/bt/modules");
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var getBody = await getResponse.Content.ReadAsStringAsync();
        var modules = JsonSerializer.Deserialize<DataResponse>(getBody, JsonOptions)!;
        modules.Data.Should().NotBeNull();

        var moduleId = modules.Data!.Value.EnumerateArray().First().GetProperty("id").GetInt32();

        // Update
        var updateResponse = await _client.PutAsJsonAsync(
            $"/bt/modules/{moduleId}",
            new { name = "UpdatedModule" }
        );
        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Delete
        var deleteResponse = await _client.DeleteAsync($"/bt/modules/{moduleId}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // ─── Translations ───────────────────────────────────────────────

    [Fact]
    public async Task Translation_Crud_Lifecycle()
    {
        await EnsureTables();
        var (moduleId, languageId) = await SeedModuleAndLanguage();

        // Create
        var createResponse = await _client.PostAsJsonAsync(
            "/bt/translations",
            new
            {
                moduleId,
                languageId,
                keyName = "home.title",
                value = "Welcome",
            }
        );
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        // Get all
        var getResponse = await _client.GetAsync("/bt/translations");
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var getBody = await getResponse.Content.ReadAsStringAsync();
        var translations = JsonSerializer.Deserialize<TranslationsResponse>(getBody, JsonOptions)!;
        translations.Success.Should().BeTrue();
        translations.TotalCount.Should().BeGreaterThan(0);
        translations.Data.Should().NotBeNull();

        var translationId = translations
            .Data!.Value.EnumerateArray()
            .First()
            .GetProperty("id")
            .GetInt32();

        // Update
        var updateResponse = await _client.PutAsJsonAsync(
            $"/bt/translations/{translationId}",
            new { value = "Welcome Home", status = "verified" }
        );
        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Delete
        var deleteResponse = await _client.DeleteAsync($"/bt/translations/{translationId}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Translation_BulkDelete()
    {
        await EnsureTables();
        var (moduleId, languageId) = await SeedModuleAndLanguage();

        // Create several translations
        for (int i = 0; i < 3; i++)
        {
            await _client.PostAsJsonAsync(
                "/bt/translations",
                new
                {
                    moduleId,
                    languageId,
                    keyName = $"bulk.key{i}",
                    value = $"Value {i}",
                }
            );
        }

        // Get all to find IDs
        var getBody = await (
            await _client.GetAsync("/bt/translations")
        ).Content.ReadAsStringAsync();
        var translations = JsonSerializer.Deserialize<TranslationsResponse>(getBody, JsonOptions)!;
        var ids = translations
            .Data!.Value.EnumerateArray()
            .Select(e => e.GetProperty("id").GetInt32())
            .ToArray();

        ids.Should().HaveCountGreaterThanOrEqualTo(3);

        // Bulk delete
        var request = new HttpRequestMessage(HttpMethod.Delete, "/bt/translations")
        {
            Content = JsonContent.Create(new { ids }),
        };
        var response = await _client.SendAsync(request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await Deserialize(response);
        body.Success.Should().BeTrue();
    }

    [Fact]
    public async Task Translation_BulkDelete_Empty_Ids_Returns_BadRequest()
    {
        await EnsureTables();

        var request = new HttpRequestMessage(HttpMethod.Delete, "/bt/translations")
        {
            Content = JsonContent.Create(new { ids = Array.Empty<int>() }),
        };
        var response = await _client.SendAsync(request);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // ─── Filtering ──────────────────────────────────────────────────

    [Fact]
    public async Task Translations_Filter_By_Keywords()
    {
        await EnsureTables();
        var (moduleId, languageId) = await SeedModuleAndLanguage();

        await _client.PostAsJsonAsync(
            "/bt/translations",
            new
            {
                moduleId,
                languageId,
                keyName = "search.unique_xyz",
                value = "SearchableValue",
            }
        );

        var response = await _client.GetAsync("/bt/translations?keywords=unique_xyz");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<TranslationsResponse>(body, JsonOptions)!;
        result.TotalCount.Should().BeGreaterThan(0);
    }

    // ─── Validation ─────────────────────────────────────────────────

    [Fact]
    public async Task Create_Translation_Invalid_Returns_400()
    {
        await EnsureTables();

        var response = await _client.PostAsJsonAsync(
            "/bt/translations",
            new
            {
                moduleId = 0,
                languageId = -1,
                keyName = "",
                value = "",
            }
        );
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Delete_NonExistent_Translation_Returns_404()
    {
        await EnsureTables();

        var response = await _client.DeleteAsync("/bt/translations/999999");
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Update_NonExistent_Translation_Returns_404()
    {
        await EnsureTables();

        var response = await _client.PutAsJsonAsync(
            "/bt/translations/999999",
            new { value = "test" }
        );
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // ─── Helpers ────────────────────────────────────────────────────

    private async Task EnsureTables()
    {
        await _client.PostAsync("/bt/createTables", null);
    }

    private async Task<(int moduleId, int languageId)> SeedModuleAndLanguage()
    {
        var uniqueSuffix = Guid.NewGuid().ToString("N")[..8];

        await _client.PostAsJsonAsync("/bt/modules", new { name = $"Mod_{uniqueSuffix}" });
        await _client.PostAsJsonAsync(
            "/bt/languages",
            new { code = uniqueSuffix[..5], name = $"Lang_{uniqueSuffix}" }
        );

        var modulesBody = await (await _client.GetAsync("/bt/modules")).Content.ReadAsStringAsync();
        var modules = JsonSerializer.Deserialize<DataResponse>(modulesBody, JsonOptions)!;
        var moduleId = modules.Data!.Value.EnumerateArray().Last().GetProperty("id").GetInt32();

        var langsBody = await (await _client.GetAsync("/bt/languages")).Content.ReadAsStringAsync();
        var langs = JsonSerializer.Deserialize<DataResponse>(langsBody, JsonOptions)!;
        var languageId = langs.Data!.Value.EnumerateArray().Last().GetProperty("id").GetInt32();

        return (moduleId, languageId);
    }

    private static async Task<ApiResult> Deserialize(HttpResponseMessage response)
    {
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<ApiResult>(content, JsonOptions)!;
    }

    private record ApiResult(bool Success, string Message, string? Error);

    private class DataResponse
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
