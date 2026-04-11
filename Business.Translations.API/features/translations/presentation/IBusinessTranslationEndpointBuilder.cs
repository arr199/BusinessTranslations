using Business.Translations.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Logging;

namespace Business.Translations.Endpoints;

public interface IBusinessTranslationEndpointBuilder
{
    static abstract void RegisterEndpoints(
        WebApplication app,
        BTConfiguration config,
        ILogger logger
    );
    static abstract void AddStaticFiles(WebApplication app, BTConfiguration config, ILogger logger);
    static abstract void AddDashboardEndpoint(
        WebApplication app,
        BTConfiguration config,
        ILogger logger
    );
    static abstract void AddTranslationsEndpoints(
        WebApplication app,
        BTConfiguration config,
        ILogger logger
    );
    static abstract void AddModulesEndpoints(
        WebApplication app,
        BTConfiguration config,
        ILogger logger
    );
    static abstract void AddLanguagesEndpoints(
        WebApplication app,
        BTConfiguration config,
        ILogger logger
    );
}
