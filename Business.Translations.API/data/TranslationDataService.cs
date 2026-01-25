using Business.Translations.API.data;
using businessTranslations.configuration;
using Microsoft.Data.SqlClient;

public class TranslationDataService
{
    private readonly BTConfiguration _config;

    public TranslationDataService(BTConfiguration config)
    {
        ArgumentNullException.ThrowIfNull(config);
        _config = config;
    }

    public async Task CreateTables()
    {
        using var connection = new SqlConnection(_config.ConnectionString);
        await connection.OpenAsync();

        var query =
            @"CREATE TABLE BTLanguages (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    Code NVARCHAR(5) UNIQUE NOT NULL,
                    Name NVARCHAR(50) UNIQUE NOT NULL,
                    IsActive BIT DEFAULT 1,
                    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
                    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
                    );
                    CREATE INDEX idx_code ON BTLanguages(Code);
                    CREATE INDEX idx_is_active ON BTLanguages(IsActive);

                    CREATE TABLE BTModules (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    Name NVARCHAR(100) UNIQUE NOT NULL,
                    Slug NVARCHAR(100) UNIQUE NOT NULL,
                    Icon NVARCHAR(50),
                    Description NVARCHAR(MAX),
                    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
                    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
                    );
                    CREATE INDEX idx_slug ON BTModules(Slug);
                    
                    CREATE TABLE BTTranslations (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    ModuleId INT NOT NULL,
                    KeyName NVARCHAR(255) NOT NULL,
                    LanguageId INT NOT NULL,
                    Value NVARCHAR(MAX),
                    Status NVARCHAR(20) DEFAULT 'pending',
                    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
                    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
                    CONSTRAINT FK_translations_modules FOREIGN KEY (ModuleId) REFERENCES BTModules(Id) ON DELETE CASCADE,
                    CONSTRAINT FK_translations_languages FOREIGN KEY (LanguageId) REFERENCES BTLanguages(Id) ON DELETE CASCADE,
                    CONSTRAINT UQ_translation UNIQUE (ModuleId, KeyName, LanguageId)
                    );
                    
                    CREATE INDEX idx_module_id ON BTTranslations(ModuleId);
                    CREATE INDEX idx_language_id ON BTTranslations(LanguageId);
                    CREATE INDEX idx_key_name ON BTTranslations(KeyName);
                    CREATE INDEX idx_status ON BTTranslations(Status);
                ";

        using var cmd = new SqlCommand(query, connection);
        var result = await cmd.ExecuteScalarAsync();

        await DatabaseSeeder.SeedDummyDataAsync(_config.ConnectionString, CancellationToken.None);
    }

    public async Task<List<TranslationModel>> GetTranslations()
    {
        using var connection = new SqlConnection(_config.ConnectionString);
        await connection.OpenAsync();
        var query =
            @"
            SELECT Id,ModuleId,KeyName,LanguageId,
            Value,Status,CreatedAt,UpdatedAt
            FROM BTTranslations;
            ";

        using var cmd = new SqlCommand(query, connection);
        var reader = await cmd.ExecuteReaderAsync();

        List<TranslationModel> results = [];

        while (await reader.ReadAsync())
        {
            TranslationModel translation = new()
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                ModuleId = reader.GetInt32(reader.GetOrdinal("ModuleId")),
                LanguageId = reader.GetInt32(reader.GetOrdinal("LanguageId")),
                KeyName = reader.GetString(reader.GetOrdinal("KeyName")),
                Value = reader.GetString(reader.GetOrdinal("Value")),
                Status = reader.GetString(reader.GetOrdinal("Status")),
                CreateAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                UpdatedAt = reader.GetDateTime(reader.GetOrdinal("UpdatedAt")),
            };

            results.Add(translation);
        }

        return results;
    }
}
