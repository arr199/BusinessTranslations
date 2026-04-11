using Business.Translations.Configuration;
using Business.Translations.Endpoints;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Business.Translations.Extensions;

public static class UseBusinessTranslationsExtension
{
    public static IEndpointRouteBuilder UseBusinessTranslations(
        this WebApplication app,
        Action<BTConfiguration>? configureOptions = null
    )
    {
        var logger = app
            .Services.GetRequiredService<ILoggerFactory>()
            .CreateLogger("Business.Translations");

        BTConfiguration configuration = new();

        configureOptions?.Invoke(configuration);

        if (configuration.Provider == DatabaseProvider.None)
        {
            throw new InvalidOperationException(
                "No database provider configured. Call UseSqlServer() inside UseBusinessTranslations options."
            );
        }

        if (configuration.AuthorizationFilter is not null)
        {
            logger.LogInformation(
                "Business.Translations authorization filter enabled for /{BasePath}/*",
                configuration.BasePath
            );
        }

        logger.LogInformation(
            "Business.Translations initialized — Provider={Provider}, BasePath=/{BasePath}",
            configuration.Provider,
            configuration.BasePath
        );

        BusinessTranslationEndpointBuilder.RegisterEndpoints(app, configuration, logger);

        return app;
    }
}
