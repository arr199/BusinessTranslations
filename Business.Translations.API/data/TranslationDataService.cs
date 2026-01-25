using System.Reflection;
using System.Text;
using Business.Translations.API.data;
using Business.Translations.API.endpoints.Translations;
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

#if DEBUG
        await DatabaseSeeder.SeedDummyDataAsync(_config.ConnectionString, CancellationToken.None);
#endif
    }

    public async Task<List<TranslationModel>> GetTranslations(GetTranslationFilters filters)
    {
        using var connection = new SqlConnection(_config.ConnectionString);
        await connection.OpenAsync();
        var sql = new StringBuilder(
            @"
            SELECT Id,ModuleId,KeyName,LanguageId,
            Value,Status,CreatedAt,UpdatedAt
            FROM BTTranslations
            "
        );

        using var cmd = new SqlCommand();
        List<string> where = [];

        //  ModuleId filter
        if (filters.ModuleId is not null)
        {
            where.Add($"ModuleId = @ModuleId");
            cmd.Parameters.AddWithValue("ModuleId", filters.ModuleId);
        }

        //  LanguageId filter
        if (filters.LanguageId is not null)
        {
            where.Add("LanguageId = @LanguageId");
            cmd.Parameters.AddWithValue("LanguageId", filters.LanguageId);
        }

        if (where.Count > 0)
        {
            sql.Append("WHERE ");
            sql.Append(string.Join(" AND ", where));
        }

        var offset = filters?.Offset ?? 0;
        var limit = filters?.Limit ?? 50;

        sql.Append(" ORDER BY KeyName ");
        sql.Append(" OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY");

        cmd.Parameters.AddWithValue("@Offset", offset);
        cmd.Parameters.AddWithValue("@Limit", limit);

#if DEBUG
        Console.WriteLine(sql.ToString());
#endif
        cmd.Connection = connection;
        cmd.CommandText = sql.ToString();

        await using var reader = await cmd.ExecuteReaderAsync();

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
