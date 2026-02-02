using System.Runtime.InteropServices.JavaScript;
using System.Text.Json;
using System.Text.Json.Serialization;
using Business.Translations.API.features.translations.data.datasource;
using businessTranslations.configuration;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Business.Translations.API.endpoints.Translations;

public class TranslationEndpointsBuilder : ITranslationEndpointsBuilder
{
    private const string CREATE_TABLES = "bt/createTables";
    private const string GET_TRANSLATIONS = "bt/translation";
    private const string GET_MODULES = "bt/modules";
    private const string GET_LANGUAGES = "bt/languages";
    private const string INSERT_TRANSLATION = "bt/translation";
    private const string UPDATE_TRANSLATION = "bt/translation";
    private const string DELETE_TRANSLATION = "bt/translation";

    public static void AddTranslationsEndpoints(WebApplication app, BTConfiguration config)
    {
        AddCreateTablesEndpoint(app, config);
        AddTranslationEndpoints(app, config);
        AddModulesEndpoints(app, config);
        AddLanguagesEndpoints(app, config);
    }

    [EndpointName(CREATE_TABLES)]
    private static void AddCreateTablesEndpoint(WebApplication app, BTConfiguration config)
    {
        var _tDataSource = new TranslationDataSource(config);
        app.MapGet(
            CREATE_TABLES,
            async (context) =>
            {
                try
                {
                    await _tDataSource.CreateTablesAsync();

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
    private static void AddTranslationEndpoints(WebApplication app, BTConfiguration config)
    {
        var _tDataSource = new TranslationDataSource(config);
        var _tValidationService = new TranslationValidationService();

        app.MapGet(
            GET_TRANSLATIONS,
            async (HttpContext context, [AsParameters] GetTranslationRequest filters) =>
            {
                try
                {
                    await _tValidationService.ValidateAsync(filters);

                    var data = await _tDataSource.GetTranslationsAsync(filters);

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

        app.MapPost(
            INSERT_TRANSLATION,
            async (HttpContext context, [FromBody] InsertTranslationRequest data) =>
            {
                try
                {
                    await _tValidationService.ValidateAsync(data);
                    await _tDataSource.InsertTranslationAsync(data);

                    await context.Response.WriteAsJsonAsync(
                        new InsertTranslationResponse()
                        {
                            Success = true,
                            Message = "translation created successfully",
                            Error = null,
                            Data = [],
                        }
                    );
                }
                catch (Exception ex)
                {
                    await context.Response.WriteAsJsonAsync(
                        new InsertTranslationResponse()
                        {
                            Success = false,
                            Message = "En error occurred while creating the translation",
                            Error = ex.ToString(),
                            Data = [],
                        }
                    );
                }
            }
        );
    }

    [EndpointName(GET_MODULES)]
    private static void AddModulesEndpoints(WebApplication app, BTConfiguration config)
    {
        var _mDataSource = new ModuleDataSource(config);
        app.MapGet(
            GET_MODULES,
            async (HttpContext context) =>
            {
                try
                {
                    var data = await _mDataSource.GetModules();

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
    private static void AddLanguagesEndpoints(WebApplication app, BTConfiguration config)
    {
        var lDataSource = new LanguageDataSource(config);
        app.MapGet(
            GET_LANGUAGES,
            async (HttpContext context) =>
            {
                try
                {
                    var data = await lDataSource.GetLanguages();

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
