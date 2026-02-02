using businessTranslations.configuration;
using Microsoft.AspNetCore.Builder;

namespace Business.Translations.API.endpoints.Translations;

public interface ITranslationEndpointsBuilder
{
    /// <summary>
    /// Add necessary endpoints for translations management
    /// </summary>
    /// <param name="app"></param>
    /// <param name="config"></param>
    static abstract void AddTranslationsEndpoints(WebApplication app, BTConfiguration config);
}
