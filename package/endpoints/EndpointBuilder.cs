using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text.RegularExpressions;
using businessTranslations.configuration;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace businessTranslations.endpoints;

public class BusinessTranslationEndpointBuilder : IBusinessTranslationEndpointBuilder
{
    public static void RegisterEndpoints(IEndpointRouteBuilder app, BTConfiguration config)
    {
        AddDashboardEndpoint(app, config);
        AddConfigurationEndpoint(app, config);
    }

    private static void AddDashboardEndpoint(IEndpointRouteBuilder app, BTConfiguration config)
    {
        string endpoint = $"{config.BasePath}/{Endpoints.DASHBOARD}";

        app.MapGet(
            endpoint,
            async (context) =>
            {
                await context.Response.WriteAsync("Hello there");
            }
        );
    }

    private static void AddConfigurationEndpoint(IEndpointRouteBuilder app, BTConfiguration config)
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
}

public static class Endpoints
{
    public const string DASHBOARD = "dashboard";
    public const string CONFIGURATION = "configuration";
}
