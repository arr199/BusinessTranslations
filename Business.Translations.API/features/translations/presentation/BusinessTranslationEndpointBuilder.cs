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
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging;

namespace Business.Translations.Endpoints;

public class BusinessTranslationEndpointBuilder : IBusinessTranslationEndpointBuilder
{
    public static void RegisterEndpoints(WebApplication app, BTConfiguration config, ILogger logger)
    {
        AddStaticFiles(app, config, logger);

        var group = app.MapGroup(config.BasePath);

        if (config.AuthorizationFilter is not null)
            group.AddEndpointFilter(config.AuthorizationFilter);

        AddDashboardEndpoint(group, config, logger);
        AddTranslationsEndpoints(group, config, logger);
        AddModulesEndpoints(group, config, logger);
        AddLanguagesEndpoints(group, config, logger);

        logger.LogInformation(
            "Business.Translations endpoints registered at /{BasePath}",
            config.BasePath
        );
    }

    public static void AddStaticFiles(WebApplication app, BTConfiguration config, ILogger logger)
    {
        var distPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "dist");
        if (!Directory.Exists(distPath))
        {
            logger.LogWarning(
                "Dashboard dist folder not found at {DistPath} — static files will not be served",
                distPath
            );
            return;
        }

        app.UseStaticFiles(
            new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(distPath),
                RequestPath = "/" + config.BasePath + "/dashboard",
            }
        );
    }

    public static void AddDashboardEndpoint(
        IEndpointRouteBuilder endpoints,
        BTConfiguration config,
        ILogger logger
    )
    {
        endpoints.MapGet(
            "dashboard",
            async (HttpContext context) =>
            {
                var path = Path.Combine(
                    AppDomain.CurrentDomain.BaseDirectory,
                    "dist",
                    "index.html"
                );
                if (!File.Exists(path))
                {
                    logger.LogWarning("Dashboard index.html not found at {Path}", path);
                    context.Response.StatusCode = 404;
                    return;
                }
                await context.Response.SendFileAsync(path);
            }
        );

        var ds = new TranslationDataSource(config);

        endpoints.MapPost(
            "createTables",
            async () =>
            {
                try
                {
                    logger.LogInformation("Creating database tables...");
                    await ds.CreateTablesAsync();
                    logger.LogInformation("Database tables created successfully");
                    return Results.Ok(
                        new ApiResponse { Success = true, Message = "Tables created successfully." }
                    );
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Failed to create database tables");
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
    public static void AddTranslationsEndpoints(
        IEndpointRouteBuilder endpoints,
        BTConfiguration config,
        ILogger logger
    )
    {
        var ds = new TranslationDataSource(config);
        var basePath = config.BasePath;

        endpoints.MapGet(
            "translations",
            async ([AsParameters] GetTranslationRequest filters) =>
            {
                try
                {
                    await ValidationService.ValidateAsync(filters);
                    var (items, totalCount) = await ds.GetTranslationsAsync(filters);
                    logger.LogDebug(
                        "Fetched {Count}/{Total} translations",
                        items.Count,
                        totalCount
                    );
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
                    logger.LogWarning(
                        "Validation failed fetching translations: {Message}",
                        ex.Message
                    );
                    return Results.Json(
                        new ApiResponse { Success = false, Message = ex.Message },
                        statusCode: 400
                    );
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error fetching translations");
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

        endpoints.MapPost(
            "translations",
            async ([FromBody] InsertTranslationRequest body) =>
            {
                try
                {
                    await ValidationService.ValidateAsync(body);
                    await ds.InsertTranslationAsync(body);
                    logger.LogInformation("Translation created — Key={Key}", body.KeyName);
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
                    logger.LogWarning(
                        "Validation failed creating translation: {Message}",
                        ex.Message
                    );
                    return Results.Json(
                        new ApiResponse { Success = false, Message = ex.Message },
                        statusCode: 400
                    );
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error creating translation");
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

        endpoints.MapPut(
            "translations/{id:int}",
            async (int id, [FromBody] UpdateTranslationRequest body) =>
            {
                try
                {
                    await ValidationService.ValidateAsync(body);
                    await ds.UpdateTranslationAsync(id, body);
                    logger.LogInformation("Translation {Id} updated", id);
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
                    logger.LogWarning(
                        "Validation failed updating translation {Id}: {Message}",
                        id,
                        ex.Message
                    );
                    return Results.Json(
                        new ApiResponse { Success = false, Message = ex.Message },
                        statusCode: 400
                    );
                }
                catch (DataException)
                {
                    logger.LogWarning("Translation {Id} not found for update", id);
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
                    logger.LogError(ex, "Error updating translation {Id}", id);
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

        endpoints.MapDelete(
            "translations/{id:int}",
            async (int id) =>
            {
                try
                {
                    await ds.DeleteTranslationAsync(id);
                    logger.LogInformation("Translation {Id} deleted", id);
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
                    logger.LogWarning("Translation {Id} not found for deletion", id);
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
                    logger.LogError(ex, "Error deleting translation {Id}", id);
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
    public static void AddModulesEndpoints(
        IEndpointRouteBuilder endpoints,
        BTConfiguration config,
        ILogger logger
    )
    {
        var ds = new ModuleDataSource(config);
        var basePath = config.BasePath;

        endpoints.MapGet(
            "modules",
            async () =>
            {
                try
                {
                    var data = await ds.GetModulesAsync();
                    logger.LogDebug("Fetched {Count} modules", data.Count);
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
                    logger.LogError(ex, "Error fetching modules");
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

        endpoints.MapPost(
            "modules",
            async ([FromBody] InsertModuleRequest body) =>
            {
                try
                {
                    await ValidationService.ValidateAsync(body);
                    await ds.InsertModuleAsync(body);
                    logger.LogInformation("Module created — Name={Name}", body.Name);
                    return Results.Created(
                        $"/{basePath}/modules",
                        new ApiResponse { Success = true, Message = "Module created successfully." }
                    );
                }
                catch (ValidationException ex)
                {
                    logger.LogWarning("Validation failed creating module: {Message}", ex.Message);
                    return Results.Json(
                        new ApiResponse { Success = false, Message = ex.Message },
                        statusCode: 400
                    );
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error creating module");
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

        endpoints.MapPut(
            "modules/{id:int}",
            async (int id, [FromBody] UpdateModuleRequest body) =>
            {
                try
                {
                    await ValidationService.ValidateAsync(body);
                    await ds.UpdateModuleAsync(id, body);
                    logger.LogInformation("Module {Id} updated", id);
                    return Results.Ok(
                        new ApiResponse { Success = true, Message = "Module updated successfully." }
                    );
                }
                catch (ValidationException ex)
                {
                    logger.LogWarning(
                        "Validation failed updating module {Id}: {Message}",
                        id,
                        ex.Message
                    );
                    return Results.Json(
                        new ApiResponse { Success = false, Message = ex.Message },
                        statusCode: 400
                    );
                }
                catch (DataException)
                {
                    logger.LogWarning("Module {Id} not found for update", id);
                    return Results.NotFound(
                        new ApiResponse { Success = false, Message = $"Module {id} not found." }
                    );
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error updating module {Id}", id);
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

        endpoints.MapDelete(
            "modules/{id:int}",
            async (int id) =>
            {
                try
                {
                    await ds.DeleteModuleAsync(id);
                    logger.LogInformation("Module {Id} deleted", id);
                    return Results.Ok(
                        new ApiResponse { Success = true, Message = "Module deleted successfully." }
                    );
                }
                catch (DataException)
                {
                    logger.LogWarning("Module {Id} not found for deletion", id);
                    return Results.NotFound(
                        new ApiResponse { Success = false, Message = $"Module {id} not found." }
                    );
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error deleting module {Id}", id);
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
    public static void AddLanguagesEndpoints(
        IEndpointRouteBuilder endpoints,
        BTConfiguration config,
        ILogger logger
    )
    {
        var ds = new LanguageDataSource(config);
        var basePath = config.BasePath;

        endpoints.MapGet(
            "languages",
            async () =>
            {
                try
                {
                    var data = await ds.GetLanguagesAsync();
                    logger.LogDebug("Fetched {Count} languages", data.Count);
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
                    logger.LogError(ex, "Error fetching languages");
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

        endpoints.MapPost(
            "languages",
            async ([FromBody] InsertLanguageRequest body) =>
            {
                try
                {
                    await ValidationService.ValidateAsync(body);
                    await ds.InsertLanguageAsync(body);
                    logger.LogInformation(
                        "Language created — Code={Code}, Name={Name}",
                        body.Code,
                        body.Name
                    );
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
                    logger.LogWarning("Validation failed creating language: {Message}", ex.Message);
                    return Results.Json(
                        new ApiResponse { Success = false, Message = ex.Message },
                        statusCode: 400
                    );
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error creating language");
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

        endpoints.MapPut(
            "languages/{id:int}",
            async (int id, [FromBody] UpdateLanguageRequest body) =>
            {
                try
                {
                    await ValidationService.ValidateAsync(body);
                    await ds.UpdateLanguageAsync(id, body);
                    logger.LogInformation("Language {Id} updated", id);
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
                    logger.LogWarning(
                        "Validation failed updating language {Id}: {Message}",
                        id,
                        ex.Message
                    );
                    return Results.Json(
                        new ApiResponse { Success = false, Message = ex.Message },
                        statusCode: 400
                    );
                }
                catch (DataException)
                {
                    logger.LogWarning("Language {Id} not found for update", id);
                    return Results.NotFound(
                        new ApiResponse { Success = false, Message = $"Language {id} not found." }
                    );
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error updating language {Id}", id);
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

        endpoints.MapDelete(
            "languages/{id:int}",
            async (int id) =>
            {
                try
                {
                    await ds.DeleteLanguageAsync(id);
                    logger.LogInformation("Language {Id} deleted", id);
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
                    logger.LogWarning("Language {Id} not found for deletion", id);
                    return Results.NotFound(
                        new ApiResponse { Success = false, Message = $"Language {id} not found." }
                    );
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error deleting language {Id}", id);
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
