# Development

## Local setup

To develop in this project, run the **`Business.Translations.SampleApp`** project — a sample host application that wires up the package like a real app would:

```bash
# Start the local database first (SQL Server + auto-created TranslationsAPI database)
docker compose up -d

# Run the sample app
dotnet run --project Business.Translations.SampleApp
```

Then open the dashboard at **http://localhost:5100/bt/dashboard**. On first load the app creates the tables (and seeds sample data in DEBUG builds).

### Frontend dev server

Optional: run the frontend dev server for hot reload while working on the dashboard UI:

```bash
cd Business.Translations.FrontEnd
pnpm install
pnpm run dev
```

Note: the Vite dev server has no API proxy — to exercise the real backend, build the FrontEnd and open the dashboard through `Business.Translations.SampleApp`.

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
        ├── BusinessTranslationEndpointBuilder.cs  # All REST endpoint registrations
        ├── entities/                   # Request/response DTOs (ApiResponse, GetTranslationRequest, etc.)
        ├── validators/                 # FluentValidation validators for each DTO
        └── services/                   # ValidationService (static dispatch to validators)

Business.Translations.FrontEnd/         # React dashboard UI (embedded in NuGet at build time)
├── src/
│   ├── translations/
│   │   ├── data/
│   │   │   ├── datasource/            # API client functions (translation-, module-, language-datasource)
│   │   │   └── migration-service.ts   # Calls POST /bt/createTables
│   │   ├── domain/types/              # TypeScript interfaces (Translation, Module, UiLanguage, API responses)
│   │   └── presentation/
│   │       ├── pages/                 # TranslationDashboard, SettingsPage
│   │       ├── components/            # Table, row, sidebar, modals, footer, dropdowns
│   │       ├── stateManagement/       # Zustand store (translation-store.ts)
│   │       ├── hooks/                 # useInitializeData, useDarkMode
│   │       └── constants/             # Database schema definitions
│   └── auth/                          # (placeholder for future auth UI)
└── dist/                              # Vite build output → embedded into the API assembly

Business.Translations.SampleApp/        # Sample host app for local development
├── Program.cs                         # Wires up UseBusinessTranslations() with SQL Server
└── appsettings.json                   # ConnectionStrings:TranslationsDb
```

## Testing local packages

`local-packages-source/` (repo root) is the local NuGet source, registered in `nuget.config`. When you build the package and want to test it locally, put the `.nupkg` there — the easiest way is to pack straight into it:

```bash
dotnet pack Business.Translations.API -c Release -o local-packages-source
```

A plain `dotnet restore` in a consuming project (e.g. `Business.Translations.SampleApp`) then resolves the package from that folder. Remember: **every new build of the package needs a new version number** — NuGet never updates an already-cached version.

## Releasing (publishing to nuget.org)

The version lives in `<Version>` in `Business.Translations.API/Business.Translations.API.csproj` — that is the single source of truth. The git tag is just the trigger and must match it (the publish workflow enforces this and fails on mismatch).

Publishing a new version:

```bash
# 1. Bump <Version> in Business.Translations.API.csproj (e.g. 1.0.0 -> 1.0.1)
# 2. Commit the bump
# 3. Tag and push — the tag must match the csproj version exactly
git tag v1.0.1
git push origin main --tags
```

What happens next (`.github/workflows/publish.yml`):

1. The `v*` tag triggers the pipeline: backend build + unit/integration tests and frontend lint + E2E all run first
2. Only if everything is green: `dotnet pack -c Release` (no DEBUG seeding, dashboard embedded) and `dotnet nuget push` to nuget.org, using the `NUGET_API_KEY` repository secret
3. `--skip-duplicate` makes re-pushing the same version a no-op; nuget.org itself never accepts the same version twice, so a released version is immutable

Notes:

- The `NUGET_API_KEY` secret is created on nuget.org (API Keys → Push scope, glob `BusinessTranslations`) and added under GitHub → Settings → Secrets and variables → Actions.
- Tags drive publishing; pushing to `main` alone only runs `ci.yml` (build + tests, no publish).
- DEBUG-only behavior (the sample-data seeder) never ships: it is compiled out in Release.

## Docker

Spin up a local SQL Server/MongoDB database:

```bash
docker compose up
```

SQL Server will be available at `localhost:1433` (sa / `YourStr0ng!Pass`). An init script (`scripts/init-db.sh`, run by the `sqlserver-init` compose service) creates the `TranslationsAPI` database automatically on fresh volumes — the tables are then created by the app via `/bt/createTables`.

To stop and clean up:

```bash
docker compose down        # keep data
docker compose down -v     # remove data volume too
```
