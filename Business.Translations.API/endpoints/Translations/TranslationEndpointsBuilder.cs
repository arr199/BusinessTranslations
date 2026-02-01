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
    private const string GET_MODULES = "bt/modules";
    private const string GET_LANGUAGES = "bt/languages";
    private const string INSERT_TRANSLATIONS = "bt/translation";
    private const string UPDATE_TRANSLATIONS = "bt/translation";
    private const string DELETE_TRANSLATIONS = "bt/translation";

    public static void AddTranslationsEndpoints(WebApplication app, BTConfiguration config)
    {
        CreateTablesEndpoint(app, config);
        GetTranslationEndpoint(app, config);
        GetModulesEndpoint(app, config);
        GetLanguagesEndpoint(app, config);
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
                        new ApiResponse()
                        {
                            Success = true,
                            Message = "Tables created successfully",
                            Error = null,
                        }
                    );
                }
                catch (Exception ex)
                {
                    await context.Response.WriteAsJsonAsync(
                        new ApiResponse()
                        {
                            Success = false,
                            Message = "En error occurred while creating the tables",
                            Error = ex.ToString(),
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
            async (HttpContext context, [AsParameters] GetTranslationFilters filters) =>
            {
                try
                {
                    var data = await _tDataService.GetTranslations(filters);

                    await context.Response.WriteAsJsonAsync(
                        new GetTranslationResponse()
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
                        new GetTranslationResponse()
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

    [EndpointName(GET_MODULES)]
    private static void GetModulesEndpoint(WebApplication app, BTConfiguration config)
    {
        var tDataService = new TranslationDataService(config);
        app.MapGet(
            GET_MODULES,
            async (HttpContext context) =>
            {
                try
                {
                    var data = await tDataService.GetModules();

                    await context.Response.WriteAsJsonAsync(
                        new GetModulesResponse
                        {
                            Success = true,
                            Message = "modules fetched successfully",
                            Error = null,
                            Data = data,
                        }
                    );
                }
                catch (Exception ex)
                {
                    await context.Response.WriteAsJsonAsync(
                        new GetModulesResponse
                        {
                            Success = false,
                            Message = "An error occurred while getting the modules",
                            Error = ex.ToString(),
                            Data = [],
                        }
                    );
                }
            }
        );
    }

    [EndpointName(GET_LANGUAGES)]
    private static void GetLanguagesEndpoint(WebApplication app, BTConfiguration config)
    {
        var tDataService = new TranslationDataService(config);
        app.MapGet(
            GET_LANGUAGES,
            async (HttpContext context) =>
            {
                try
                {
                    var data = await tDataService.GetLanguages();

                    await context.Response.WriteAsJsonAsync(
                        new GetLanguagesResponse
                        {
                            Success = true,
                            Message = "languages fetched successfully",
                            Error = null,
                            Data = data,
                        }
                    );
                }
                catch (Exception ex)
                {
                    await context.Response.WriteAsJsonAsync(
                        new GetLanguagesResponse
                        {
                            Success = false,
                            Message = "An error occurred while getting the languages",
                            Error = ex.ToString(),
                            Data = [],
                        }
                    );
                }
            }
        );
    }
}

public class GetTranslationFilters
{
    public int? ModuleId { get; set; }
    public string? Keywords { get; set; }
    public int? LanguageId { get; set; }
    public int? Limit { get; set; } = 50;
    public int? Offset { get; set; } = 0;
}

public class GetTranslationResponse() : ApiResponse
{
    public required List<TranslationModel> Data { get; set; }
}

public class GetModulesResponse() : ApiResponse
{
    public required List<ModuleModel> Data { get; set; }
}

public class GetLanguagesResponse() : ApiResponse
{
    public required List<LanguageModel> Data { get; set; }
}

public class ApiResponse()
{
    public required bool Success { get; set; }
    public required string Message { get; set; }
    public required string? Error { get; set; }
}
