# Business.Translations

An ASP.NET package that provides a built-in UI dashboard and REST API for managing translations (i18n) in your application.

## Quick Start

```bash
dotnet add package BusinessTranslations
```

```csharp
var app = builder.Build();

app.UseBusinessTranslations(config =>
{
    config.UseSqlServer("your-connection-string");
    // config.BasePath = "bt"; // optional, defaults to "bt"
});

app.Run();
```

### Authorization

Protect all BT endpoints (dashboard + API) by providing your own `IEndpointFilter`:

```csharp
// 1. Create your filter
public class MyAuthFilter : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(
        EndpointFilterInvocationContext context,
        EndpointFilterDelegate next)
    {
        var user = context.HttpContext.User;

        if (user.Identity?.IsAuthenticated != true || !user.IsInRole("Admin"))
        {
            return Results.Json(
                new { success = false, message = "Unauthorized." },
                statusCode: StatusCodes.Status401Unauthorized);
        }

        return await next(context);
    }
}

// 2. Register it
app.UseBusinessTranslations(config =>
{
    config.UseSqlServer("your-connection-string")
          .UseAuthorizationFilter(new MyAuthFilter());
});
```

Then navigate to `/bt/dashboard` in your browser to manage translations.

### Initialize the Database

Send a POST to `/bt/createTables` to create the required tables (`BTLanguages`, `BTModules`, `BTTranslations`). This is idempotent — safe to call multiple times.

## Features

- **Dashboard UI** — React-based SPA served at `/{basePath}/dashboard`
- **Full CRUD** for translations, modules, and languages via REST API
- **Builder pattern** — `config.UseSqlServer(connectionString)` (extensible for future providers)
- **Configurable base path** — all endpoints scoped under `/{basePath}/`
- **FluentValidation** on all request DTOs
- **Proper HTTP status codes** — 400 for validation, 404 for not found, 500 for server errors
- **Configurable authorization** — `config.UseAuthorizationFilter(myFilter)` with your own `IEndpointFilter` implementation
- **Docker compose** — `docker compose up` for a local SQL Server database

## API Endpoints

All endpoints are prefixed with `/{basePath}` (default: `/bt`).

| Method | Path                    | Description                                                                    |
| ------ | ----------------------- | ------------------------------------------------------------------------------ |
| GET    | `/bt/dashboard`         | UI dashboard                                                                   |
| POST   | `/bt/createTables`      | Create database tables                                                         |
| GET    | `/bt/translations`      | List translations (supports `?moduleId=&languageId=&keywords=&limit=&offset=`) |
| POST   | `/bt/translations`      | Create a translation                                                           |
| PUT    | `/bt/translations/{id}` | Update a translation                                                           |
| DELETE | `/bt/translations/{id}` | Delete a translation                                                           |
| GET    | `/bt/modules`           | List modules                                                                   |
| POST   | `/bt/modules`           | Create a module                                                                |
| PUT    | `/bt/modules/{id}`      | Update a module                                                                |
| DELETE | `/bt/modules/{id}`      | Delete a module                                                                |
| GET    | `/bt/languages`         | List languages                                                                 |
| POST   | `/bt/languages`         | Create a language                                                              |
| PUT    | `/bt/languages/{id}`    | Update a language                                                              |
| DELETE | `/bt/languages/{id}`    | Delete a language                                                              |

## Project Structure

```
Business.Translations.API/              # NuGet package (published as BusinessTranslations)
├── core/
│   ├── configuration/                  # BTConfiguration, builder pattern, DatabaseProvider enum
│   └── extensions/                     # UseBusinessTranslations() entry point
└── features/translations/
    ├── data/
    │   ├── datasource/                 # SQL data access (TranslationDataSource, ModuleDataSource, LanguageDataSource)
    │   ├── models/                     # DB models (TranslationModel, ModuleModel, LanguageModel)
    │   └── seeder/                     # DatabaseSeeder for sample data
    └── presentation/
        ├── EndpointBuilder.cs          # All REST endpoint registrations
        ├── entities/                   # Request/response DTOs (ApiResponse, GetTranslationRequest, etc.)
        ├── validators/                 # FluentValidation validators for each DTO
        └── services/                   # ValidationService (static dispatch to validators)

Business.Translations.FrontEnd/         # React dashboard UI (embedded in NuGet at build time)
├── src/
│   ├── translations/
│   │   ├── data/
│   │   │   ├── datasource/            # API client functions (translation-, module-, language-datasource)
│   │   │   └── migrationService.ts    # Calls POST /bt/createTables
│   │   ├── domain/types/              # TypeScript interfaces (Translation, Module, UiLanguage, API responses)
│   │   └── presentation/
│   │       ├── pages/                 # TranslationDashboard, SettingsPage
│   │       ├── components/            # Table, row, sidebar, modals, footer, dropdowns
│   │       ├── stateManagement/       # Zustand store (translation-store.ts)
│   │       ├── hooks/                 # useInitializeData, useDarkMode
│   │       └── constants/             # Database schema definitions
│   └── auth/                          # (placeholder for future auth UI)
└── dist/                              # Vite build output → served as static files

testapi/                                # Minimal API host for local development
├── Program.cs                         # Wires up UseBusinessTranslations() with SQL Server
└── appsettings.json                   # ConnectionStrings:TranslationsDb
```

## Development

```bash
# Run the test API
cd testapi
dotnet run

# Run the frontend dev server (hot reload)
cd Business.Translations.FrontEnd
npm install
npm run dev
```

### Docker

Spin up a local SQLServer/mongodb database:

```bash
docker compose up
```

SQL Server will be available at `localhost:1433` (sa / `YourStr0ng!Pass`).

To stop and clean up:

```bash
docker compose down        # keep data
docker compose down -v     # remove data volume too
```
