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
}
