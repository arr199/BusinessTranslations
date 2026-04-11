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

## TODO

### BUGFIXES

### Infrastructure

- [ ] Add auth filter / middleware to protect API endpoints (e.g. API key, JWT)
- [ ] Add unit tests
- [ ] Dockerfile/docker-compose for running the API and a database in a containerized environment for development/testing
- [ ] Add more DB providers (SQLite, PostgreSQL)
- [ ] Add entity framework to abstract away database access and make it easier to support multiple providers in the future
- [ ] CI/CD pipeline for running tests and publishing to NuGet
- [ ] API version
- [ ] CORS policy for the API (allow dashboard frontend, restrict others)

### Features

- [ ] Copy key to clipboard — click-to-copy on the key column
- [ ] Diff view for edits — show original vs new value before saving
- [ ] Export/import translations (JSON, CSV)
- [ ] Bulk actions — checkboxes to delete/change status of multiple rows at once
- [ ] Filter by status in the filter bar (show only missing, pending, verified)
- [ ] Translation completeness bar — per-module/per-language progress (% verified vs pending vs missing)

### UI/UX

- [ ] Toast notifications — replace `alert()` with non-blocking toast popups (success/error)
- [ ] Empty states — illustrated empty states when no translations or no search results
- [ ] Keyboard shortcuts — Tab through rows, Enter to save, Escape to cancel
- [ ] Drag-to-resize columns