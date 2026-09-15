using Business.Translations.Extensions;
using Microsoft.AspNetCore.Builder;
using Testcontainers.MsSql;

namespace Business.Translations.IntegrationTests.Factories;

public class TranslationsApiFactory : IAsyncLifetime
{
    private readonly MsSqlContainer _sqlContainer = new MsSqlBuilder("mcr.microsoft.com/mssql/server:2022-latest")
        .Build();

    private WebApplication? _app;
    private HttpClient? _client;

    public HttpClient Client => _client ?? throw new InvalidOperationException("Factory not initialized");

    public async Task InitializeAsync()
    {
        await _sqlContainer.StartAsync();

        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Services.AddRouting();

        _app = builder.Build();

        _app.UseBusinessTranslations(config =>
        {
            config.UseSqlServer(_sqlContainer.GetConnectionString());
        });

        await _app.StartAsync();

        var address = _app.Urls.First();
        _client = new HttpClient { BaseAddress = new Uri(address) };
    }

    public async Task DisposeAsync()
    {
        _client?.Dispose();
        if (_app is not null)
            await _app.DisposeAsync();
        await _sqlContainer.DisposeAsync();
    }
}
