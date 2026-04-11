using Business.Translations.Configuration;
using Business.Translations.Endpoints;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace Business.Translations.Extensions;

public static class UseBusinessTranslationsExtension
{
    public static IEndpointRouteBuilder UseBusinessTranslations(
        this WebApplication app,
        Action<BTConfiguration>? configureOptions = null
    )
    {
        BTConfiguration configuration = new();

        configureOptions?.Invoke(configuration);

        if (configuration.Provider == DatabaseProvider.None)
        {
            throw new InvalidOperationException(
                "No database provider configured. Call UseSqlServer() inside UseBusinessTranslations options."
            );
        }

        BusinessTranslationEndpointBuilder.RegisterEndpoints(app, configuration);

        return app;
    }
}
