using Business.Translations.Configuration;
using Microsoft.AspNetCore.Builder;

namespace Business.Translations.Endpoints;

public interface IBusinessTranslationEndpointBuilder
{
    static abstract void RegisterEndpoints(WebApplication app, BTConfiguration config);
    static abstract void AddStaticFiles(WebApplication app, BTConfiguration config);
    static abstract void AddDashboardEndpoint(WebApplication app, BTConfiguration config);
    static abstract void AddTranslationsEndpoints(WebApplication app, BTConfiguration config);
    static abstract void AddModulesEndpoints(WebApplication app, BTConfiguration config);
    static abstract void AddLanguagesEndpoints(WebApplication app, BTConfiguration config);
}
