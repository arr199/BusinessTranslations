using businessTranslations.configuration;
using businessTranslations.endpoints;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

public interface IBusinessTranslationEndpointBuilder
{
    /// <summary>
    /// Registers all Business Translation endpoints with the provided configuration.
    /// </summary>
    /// <param name="app">The endpoint route builder.</param>
    /// <param name="config">The Business Translation configuration.</param>
    static abstract void RegisterEndpoints(WebApplication app, BTConfiguration config);

    /// <summary>
    ///  Serves the javascript and all static assets being used in the frontend
    /// </summary>
    /// <param name="app">The endpoint route builder.</param>
    /// <param name="config">The Business Translation configuration.</param>
    static abstract void AddStaticFiles(WebApplication app, BTConfiguration config);

    /// <summary>
    /// Translations dashboard endpoint (UI)
    /// </summary>
    /// <remarks>/bt/dashboard</remarks>
    /// <param name="app">The endpoint route builder.</param>
    /// <param name="config">The Business Translation configuration.</param>
    static abstract void AddDashboardEndpoint(WebApplication app, BTConfiguration config);

    /// <summary>
    /// Add the necessaryEndpoints to manage all CRUD translations operations
    /// </summary>
    /// <remarks>/bt/translations</remarks>
    /// <param name="app"></param>
    /// <param name="config"></param>
    static abstract void AddTranslationsEndpoints(WebApplication app, BTConfiguration config);
}
