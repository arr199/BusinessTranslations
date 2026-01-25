using System.Runtime.InteropServices.JavaScript;
using System.Text.Json.Serialization;
using businessTranslations.configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Business.Translations.API.endpoints.Translations;

public class TranslationEndpointsBuilder : ITranslationEndpointsBuilder
{
    private const string CREATE_TABLES = "bt/createTables";
    private const string GET_TRANSLATIONS = "bt/translation";
    private const string INSERT_TRANSLATIONS = "bt/translation";
    private const string UPDATE_TRANSLATIONS = "bt/translation";
    private const string DELETE_TRANSLATIONS = "bt/translation";

    public static void AddTranslationsEndpoints(WebApplication app, BTConfiguration config)
    {
        CreateTablesEndpoint(app, config);
        GetTranslationEndpoint(app, config);
    }

    [EndpointName(CREATE_TABLES)]
    private static void CreateTablesEndpoint(WebApplication app, BTConfiguration config)
    {
        var _tDataService = new TranslationDataService(config);
        app.MapGet(
            CREATE_TABLES,
            async (context) =>
            {
                try
                {
                    await _tDataService.CreateTables();

                    await context.Response.WriteAsJsonAsync(
                        new TranslationApiResponse()
                        {
                            Success = true,
                            Message = "Tables created successfully",
                            Error = null,
                            Data = [],
                        }
                    );
                }
                catch (Exception ex)
                {
                    await context.Response.WriteAsJsonAsync(
                        new TranslationApiResponse()
                        {
                            Success = false,
                            Message = "En error occurred while creating the tables",
                            Error = ex.ToString(),
                            Data = [],
                        }
                    );
                }
            }
        );
    }

    [EndpointName(GET_TRANSLATIONS)]
    private static void GetTranslationEndpoint(WebApplication app, BTConfiguration config)
    {
        var _tDataService = new TranslationDataService(config);
        app.MapGet(
            GET_TRANSLATIONS,
            async (context) =>
            {
                try
                {
                    var data = await _tDataService.GetTranslations();

                    await context.Response.WriteAsJsonAsync(
                        new GetTranslationDto()
                        {
                            Success = true,
                            Message = "translation fetched successfully",
                            Error = null,
                            Data = data,
                        }
                    );
                }
                catch (Exception ex)
                {
                    await context.Response.WriteAsJsonAsync(
                        new GetTranslationDto()
                        {
                            Success = false,
                            Message = "En error occurred while getting the translations",
                            Error = ex.ToString(),
                            Data = [],
                        }
                    );
                }
            }
        );
    }
}

public class GetTranslationDto()
{
    public required bool Success { get; set; }
    public required string Message { get; set; }
    public required string? Error { get; set; }
    public required List<TranslationModel> Data { get; set; }
}

public class TranslationApiResponse()
{
    public required bool Success { get; set; }
    public required string Message { get; set; }
    public required string? Error { get; set; }
    public required List<TranslationModel>? Data { get; set; }
}
