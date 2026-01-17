using System.Text.Json;
using businessTranslations.configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.FileProviders;

namespace businessTranslations.endpoints;

public class BusinessTranslationEndpointBuilder : IBusinessTranslationEndpointBuilder
{
    public static void RegisterEndpoints(WebApplication app, BTConfiguration config)
    {
        AddStaticFiles(app, config);
        AddDashboardEndpoint(app, config);
        AddConfigurationEndpoint(app, config);
    }

    private static void AddStaticFiles(WebApplication app, BTConfiguration config)
    {
        app.UseStaticFiles(
            new StaticFileOptions()
            {
                FileProvider = new PhysicalFileProvider(
                    Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "dist")
                ),
                RequestPath = "/" + config.BasePath + "/dashboard",
            }
        );
    }

    // /dashboard
    private static void AddDashboardEndpoint(WebApplication app, BTConfiguration config)
    {
        string endpoint = $"{config.BasePath}/{Endpoints.DASHBOARD}";

        app.MapGet(
            endpoint,
            async (context) =>
            {
                string path = Path.Combine(
                    AppDomain.CurrentDomain.BaseDirectory,
                    "dist",
                    "index.html"
                );

                await context.Response.SendFileAsync(path);
            }
        );
    }

    //  /configuration
    private static void AddConfigurationEndpoint(WebApplication app, BTConfiguration config)
    {
        string endpoint = $"{config.BasePath}/{Endpoints.CONFIGURATION}";

        app.MapGet(
            endpoint,
            async (context) =>
            {
                await context.Response.WriteAsync(JsonSerializer.Serialize(config));
            }
        );
    }

    public static class Endpoints
    {
        public const string DASHBOARD = "dashboard";
        public const string CONFIGURATION = "configuration";
    }
}
