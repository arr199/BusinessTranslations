using Business.Translations.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
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
        IEndpointRouteBuilder endpoints,
        BTConfiguration config,
        ILogger logger
    );
    static abstract void AddTranslationsEndpoints(
        IEndpointRouteBuilder endpoints,
        BTConfiguration config,
        ILogger logger
    );
    static abstract void AddModulesEndpoints(
        IEndpointRouteBuilder endpoints,
        BTConfiguration config,
        ILogger logger
    );
    static abstract void AddLanguagesEndpoints(
        IEndpointRouteBuilder endpoints,
        BTConfiguration config,
        ILogger logger
    );
}
