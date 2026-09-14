using Business.Translations.Extensions;
using FluentAssertions;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Logging;

namespace Business.Translations.IntegrationTests;

public class StartupLogTests
{
    [Fact]
    public async Task UseBusinessTranslations_Logs_Dashboard_Url_At_Startup()
    {
        var provider = new CapturingLoggerProvider();

        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Logging.AddProvider(provider);
        builder.Services.AddRouting();

        using var app = builder.Build();

        app.UseBusinessTranslations(config =>
        {
            config.UseSqlServer("Server=localhost;Database=unused;User Id=sa;Password=not-a-real-password;TrustServerCertificate=true");
        });

        try
        {
            await app.StartAsync();

            var messages = provider.GetMessages("Business.Translations");
            messages.Should().Contain(m => m.Contains("/bt/dashboard"));
            messages.Should().Contain(m => m.Contains("http://"));
        }
        finally
        {
            await app.StopAsync();
        }
    }

    private class CapturingLoggerProvider : ILoggerProvider
    {
        private readonly List<(string Category, string Message)> _messages = [];
        private readonly object _lock = new();

        public ILogger CreateLogger(string categoryName) => new CapturingLogger(this, categoryName);

        public List<string> GetMessages(string category)
        {
            lock (_lock)
            {
                return [.. _messages.Where(m => m.Category == category).Select(m => m.Message)];
            }
        }

        public void Dispose() { }

        private class CapturingLogger(CapturingLoggerProvider provider, string category) : ILogger
        {
            public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

            public bool IsEnabled(LogLevel logLevel) => true;

            public void Log<TState>(
                LogLevel logLevel,
                EventId eventId,
                TState state,
                Exception? exception,
                Func<TState, Exception?, string> formatter
            )
            {
                lock (provider._lock)
                {
                    provider._messages.Add((category, formatter(state, exception)));
                }
            }
        }
    }
}
