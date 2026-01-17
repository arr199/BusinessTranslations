using businessTranslations.configuration;
using businessTranslations.endpoints;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace businessTranslations.extensions;

public static class UseBusinessTranslationsExtension
{
    public static IEndpointRouteBuilder UseBusinessTranslations(
        this WebApplication app,
        Action<BTConfiguration>? configureOptions = null
    )
    {
        BTConfiguration configuration = new();

        if (configureOptions is not null)
        {
            configureOptions(configuration);
        }

        BusinessTranslationEndpointBuilder.RegisterEndpoints(app, configuration);

        return app;
    }
}
