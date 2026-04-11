using System.Data;
using System.Text.Json;
using Business.Translations.Configuration;
using Business.Translations.DataSources;
using Business.Translations.DTOs;
using Business.Translations.Services;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileProviders;

namespace Business.Translations.Endpoints;

public class BusinessTranslationEndpointBuilder : IBusinessTranslationEndpointBuilder
{
    public static void RegisterEndpoints(WebApplication app, BTConfiguration config)
    {
        AddStaticFiles(app, config);
        AddDashboardEndpoint(app, config);
        AddCreateTablesEndpoint(app, config);
        AddTranslationsEndpoints(app, config);
        AddModulesEndpoints(app, config);
        AddLanguagesEndpoints(app, config);
    }

    public static void AddStaticFiles(WebApplication app, BTConfiguration config)
    {
        var distPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "dist");
        if (!Directory.Exists(distPath))
            return;

        app.UseStaticFiles(
            new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(distPath),
                RequestPath = "/" + config.BasePath + "/dashboard",
            }
        );
    }

    public static void AddDashboardEndpoint(WebApplication app, BTConfiguration config)
    {
        app.MapGet(
            $"{config.BasePath}/dashboard",
            async (HttpContext context) =>
            {
                var path = Path.Combine(
                    AppDomain.CurrentDomain.BaseDirectory,
                    "dist",
                    "index.html"
                );
                if (!File.Exists(path))
                {
                    context.Response.StatusCode = 404;
                    return;
                }
                await context.Response.SendFileAsync(path);
            }
        );
    }

    // ─── Tables ─────────────────────────────────────────────────────
    private static void AddCreateTablesEndpoint(WebApplication app, BTConfiguration config)
    {
        var ds = new TranslationDataSource(config);

        app.MapPost(
            $"{config.BasePath}/createTables",
            async () =>
            {
                try
                {
                    await ds.CreateTablesAsync();
                    return Results.Ok(
                        new ApiResponse { Success = true, Message = "Tables created successfully." }
                    );
                }
                catch (Exception ex)
                {
                    return Results.Json(
                        new ApiResponse
                        {
                            Success = false,
                            Message = "Error creating tables.",
                            Error = ex.Message,
                        },
                        statusCode: 500
                    );
                }
            }
        );
    }

    // ─── Translations ───────────────────────────────────────────────
    public static void AddTranslationsEndpoints(WebApplication app, BTConfiguration config)
    {
        var ds = new TranslationDataSource(config);
        var basePath = config.BasePath;

        app.MapGet(
            $"{basePath}/translations",
            async ([AsParameters] GetTranslationRequest filters) =>
            {
                try
                {
                    await ValidationService.ValidateAsync(filters);
                    var (items, totalCount) = await ds.GetTranslationsAsync(filters);
                    return Results.Ok(
                        new GetTranslationResponse
                        {
                            Success = true,
                            Message = "Translations fetched successfully.",
                            Data = items,
                            TotalCount = totalCount,
                        }
                    );
                }
                catch (ValidationException ex)
                {
                    return Results.Json(
                        new ApiResponse { Success = false, Message = ex.Message },
                        statusCode: 400
                    );
                }
                catch (Exception ex)
                {
                    return Results.Json(
                        new ApiResponse
                        {
                            Success = false,
                            Message = "Error fetching translations.",
                            Error = ex.Message,
                        },
                        statusCode: 500
                    );
                }
            }
        );

        app.MapPost(
            $"{basePath}/translations",
            async ([FromBody] InsertTranslationRequest body) =>
            {
                try
                {
                    await ValidationService.ValidateAsync(body);
                    await ds.InsertTranslationAsync(body);
                    return Results.Created(
                        $"/{basePath}/translations",
                        new ApiResponse
                        {
                            Success = true,
                            Message = "Translation created successfully.",
                        }
                    );
                }
                catch (ValidationException ex)
                {
                    return Results.Json(
                        new ApiResponse { Success = false, Message = ex.Message },
                        statusCode: 400
                    );
                }
                catch (Exception ex)
                {
                    return Results.Json(
                        new ApiResponse
                        {
                            Success = false,
                            Message = "Error creating translation.",
                            Error = ex.Message,
                        },
                        statusCode: 500
                    );
                }
            }
        );

        app.MapPut(
            $"{basePath}/translations/{{id:int}}",
            async (int id, [FromBody] UpdateTranslationRequest body) =>
            {
                try
                {
                    await ValidationService.ValidateAsync(body);
                    await ds.UpdateTranslationAsync(id, body);
                    return Results.Ok(
                        new ApiResponse
                        {
                            Success = true,
                            Message = "Translation updated successfully.",
                        }
                    );
                }
                catch (ValidationException ex)
                {
                    return Results.Json(
                        new ApiResponse { Success = false, Message = ex.Message },
                        statusCode: 400
                    );
                }
                catch (DataException)
                {
                    return Results.NotFound(
                        new ApiResponse
                        {
                            Success = false,
                            Message = $"Translation {id} not found.",
                        }
                    );
                }
                catch (Exception ex)
                {
                    return Results.Json(
                        new ApiResponse
                        {
                            Success = false,
                            Message = "Error updating translation.",
                            Error = ex.Message,
                        },
                        statusCode: 500
                    );
                }
            }
        );

        app.MapDelete(
            $"{basePath}/translations/{{id:int}}",
            async (int id) =>
            {
                try
                {
                    await ds.DeleteTranslationAsync(id);
                    return Results.Ok(
                        new ApiResponse
                        {
                            Success = true,
                            Message = "Translation deleted successfully.",
                        }
                    );
                }
                catch (DataException)
                {
                    return Results.NotFound(
                        new ApiResponse
                        {
                            Success = false,
                            Message = $"Translation {id} not found.",
                        }
                    );
                }
                catch (Exception ex)
                {
                    return Results.Json(
                        new ApiResponse
                        {
                            Success = false,
                            Message = "Error deleting translation.",
                            Error = ex.Message,
                        },
                        statusCode: 500
                    );
                }
            }
        );
    }

    // ─── Modules ────────────────────────────────────────────────────
    public static void AddModulesEndpoints(WebApplication app, BTConfiguration config)
    {
        var ds = new ModuleDataSource(config);
        var basePath = config.BasePath;

        app.MapGet(
            $"{basePath}/modules",
            async () =>
            {
                try
                {
                    var data = await ds.GetModulesAsync();
                    return Results.Ok(
                        new GetModulesResponse
                        {
                            Success = true,
                            Message = "Modules fetched successfully.",
                            Data = data,
                        }
                    );
                }
                catch (Exception ex)
                {
                    return Results.Json(
                        new ApiResponse
                        {
                            Success = false,
                            Message = "Error fetching modules.",
                            Error = ex.Message,
                        },
                        statusCode: 500
                    );
                }
            }
        );

        app.MapPost(
            $"{basePath}/modules",
            async ([FromBody] InsertModuleRequest body) =>
            {
                try
                {
                    await ValidationService.ValidateAsync(body);
                    await ds.InsertModuleAsync(body);
                    return Results.Created(
                        $"/{basePath}/modules",
                        new ApiResponse { Success = true, Message = "Module created successfully." }
                    );
                }
                catch (ValidationException ex)
                {
                    return Results.Json(
                        new ApiResponse { Success = false, Message = ex.Message },
                        statusCode: 400
                    );
                }
                catch (Exception ex)
                {
                    return Results.Json(
                        new ApiResponse
                        {
                            Success = false,
                            Message = "Error creating module.",
                            Error = ex.Message,
                        },
                        statusCode: 500
                    );
                }
            }
        );

        app.MapPut(
            $"{basePath}/modules/{{id:int}}",
            async (int id, [FromBody] UpdateModuleRequest body) =>
            {
                try
                {
                    await ValidationService.ValidateAsync(body);
                    await ds.UpdateModuleAsync(id, body);
                    return Results.Ok(
                        new ApiResponse { Success = true, Message = "Module updated successfully." }
                    );
                }
                catch (ValidationException ex)
                {
                    return Results.Json(
                        new ApiResponse { Success = false, Message = ex.Message },
                        statusCode: 400
                    );
                }
                catch (DataException)
                {
                    return Results.NotFound(
                        new ApiResponse { Success = false, Message = $"Module {id} not found." }
                    );
                }
                catch (Exception ex)
                {
                    return Results.Json(
                        new ApiResponse
                        {
                            Success = false,
                            Message = "Error updating module.",
                            Error = ex.Message,
                        },
                        statusCode: 500
                    );
                }
            }
        );

        app.MapDelete(
            $"{basePath}/modules/{{id:int}}",
            async (int id) =>
            {
                try
                {
                    await ds.DeleteModuleAsync(id);
                    return Results.Ok(
                        new ApiResponse { Success = true, Message = "Module deleted successfully." }
                    );
                }
                catch (DataException)
                {
                    return Results.NotFound(
                        new ApiResponse { Success = false, Message = $"Module {id} not found." }
                    );
                }
                catch (Exception ex)
                {
                    return Results.Json(
                        new ApiResponse
                        {
                            Success = false,
                            Message = "Error deleting module.",
                            Error = ex.Message,
                        },
                        statusCode: 500
                    );
                }
            }
        );
    }

    // ─── Languages ──────────────────────────────────────────────────
    public static void AddLanguagesEndpoints(WebApplication app, BTConfiguration config)
    {
        var ds = new LanguageDataSource(config);
        var basePath = config.BasePath;

        app.MapGet(
            $"{basePath}/languages",
            async () =>
            {
                try
                {
                    var data = await ds.GetLanguagesAsync();
                    return Results.Ok(
                        new GetLanguagesResponse
                        {
                            Success = true,
                            Message = "Languages fetched successfully.",
                            Data = data,
                        }
                    );
                }
                catch (Exception ex)
                {
                    return Results.Json(
                        new ApiResponse
                        {
                            Success = false,
                            Message = "Error fetching languages.",
                            Error = ex.Message,
                        },
                        statusCode: 500
                    );
                }
            }
        );

        app.MapPost(
            $"{basePath}/languages",
            async ([FromBody] InsertLanguageRequest body) =>
            {
                try
                {
                    await ValidationService.ValidateAsync(body);
                    await ds.InsertLanguageAsync(body);
                    return Results.Created(
                        $"/{basePath}/languages",
                        new ApiResponse
                        {
                            Success = true,
                            Message = "Language created successfully.",
                        }
                    );
                }
                catch (ValidationException ex)
                {
                    return Results.Json(
                        new ApiResponse { Success = false, Message = ex.Message },
                        statusCode: 400
                    );
                }
                catch (Exception ex)
                {
                    return Results.Json(
                        new ApiResponse
                        {
                            Success = false,
                            Message = "Error creating language.",
                            Error = ex.Message,
                        },
                        statusCode: 500
                    );
                }
            }
        );

        app.MapPut(
            $"{basePath}/languages/{{id:int}}",
            async (int id, [FromBody] UpdateLanguageRequest body) =>
            {
                try
                {
                    await ValidationService.ValidateAsync(body);
                    await ds.UpdateLanguageAsync(id, body);
                    return Results.Ok(
                        new ApiResponse
                        {
                            Success = true,
                            Message = "Language updated successfully.",
                        }
                    );
                }
                catch (ValidationException ex)
                {
                    return Results.Json(
                        new ApiResponse { Success = false, Message = ex.Message },
                        statusCode: 400
                    );
                }
                catch (DataException)
                {
                    return Results.NotFound(
                        new ApiResponse { Success = false, Message = $"Language {id} not found." }
                    );
                }
                catch (Exception ex)
                {
                    return Results.Json(
                        new ApiResponse
                        {
                            Success = false,
                            Message = "Error updating language.",
                            Error = ex.Message,
                        },
                        statusCode: 500
                    );
                }
            }
        );

        app.MapDelete(
            $"{basePath}/languages/{{id:int}}",
            async (int id) =>
            {
                try
                {
                    await ds.DeleteLanguageAsync(id);
                    return Results.Ok(
                        new ApiResponse
                        {
                            Success = true,
                            Message = "Language deleted successfully.",
                        }
                    );
                }
                catch (DataException)
                {
                    return Results.NotFound(
                        new ApiResponse { Success = false, Message = $"Language {id} not found." }
                    );
                }
                catch (Exception ex)
                {
                    return Results.Json(
                        new ApiResponse
                        {
                            Success = false,
                            Message = "Error deleting language.",
                            Error = ex.Message,
                        },
                        statusCode: 500
                    );
                }
            }
        );
    }
}
