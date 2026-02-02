using System.Data;
using System.Reflection;
using System.Text;
using System.Text.Json;
using Business.Translations.API.data;
using Business.Translations.API.endpoints.Translations;
using businessTranslations.configuration;
using Microsoft.Data.SqlClient;

public class TranslationDataSource
{
    private readonly BTConfiguration _config;

    public TranslationDataSource(BTConfiguration config)
    {
        ArgumentNullException.ThrowIfNull(config);
        _config = config;
    }

    public async Task CreateTablesAsync()
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

    public async Task<List<TranslationModel>> GetTranslationsAsync(GetTranslationRequest filters)
    {
        using var connection = new SqlConnection(_config.ConnectionString);
        await connection.OpenAsync();
        var sql = new StringBuilder(
            @"
            SELECT
                t.Id,
                t.ModuleId,
                t.LanguageId,
                t.KeyName,
                COALESCE(t.Value, N'') AS Value,
                t.Status,
                t.CreatedAt,
                t.UpdatedAt,

                JSON_QUERY((
                    SELECT
                        m.Id,
                        m.Name,
                        m.Slug,
                        m.Icon,
                        m.Description,
                        m.CreatedAt,
                        m.UpdatedAt
                    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                )) AS Module,

                JSON_QUERY((
                    SELECT
                        l.Id,
                        l.Code,
                        l.Name,
                        l.IsActive,
                        l.CreatedAt,
                        l.UpdatedAt
                    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                )) AS Language
            FROM BTTranslations t
            INNER JOIN BTModules m ON m.Id = t.ModuleId
            INNER JOIN BTLanguages l ON l.Id = t.LanguageId
            "
        );

        using var cmd = new SqlCommand();
        List<string> where = [];

        //  ModuleId filter
        if (filters.ModuleId is not null)
        {
            where.Add("t.ModuleId = @ModuleId");
            cmd.Parameters.AddWithValue("ModuleId", filters.ModuleId);
        }

        //  LanguageId filter
        if (filters.LanguageId is not null)
        {
            where.Add("t.LanguageId = @LanguageId");
            cmd.Parameters.AddWithValue("LanguageId", filters.LanguageId);
        }

        if (!string.IsNullOrWhiteSpace(filters.Keywords))
        {
            where.Add("(t.KeyName LIKE @Keywords OR COALESCE(t.Value, N'') LIKE @Keywords)");
            cmd.Parameters.AddWithValue("Keywords", $"%{filters.Keywords.Trim()}%");
        }

        if (where.Count > 0)
        {
            sql.Append(" WHERE ");
            sql.Append(string.Join(" AND ", where));
        }

        var offset = filters?.Offset ?? 0;
        var limit = filters?.Limit ?? 50;

        sql.Append(" ORDER BY t.KeyName ");
        sql.Append(" OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY");

        cmd.Parameters.AddWithValue("Offset", offset);
        cmd.Parameters.AddWithValue("Limit", limit);

#if DEBUG
        Console.WriteLine(sql.ToString());
#endif
        cmd.Connection = connection;
        cmd.CommandText = sql.ToString();

        await using var reader = await cmd.ExecuteReaderAsync();

        List<TranslationModel> results = [];

        while (await reader.ReadAsync())
        {
            var moduleJson = reader.IsDBNull(reader.GetOrdinal("Module"))
                ? null
                : reader.GetString(reader.GetOrdinal("Module"));
            var languageJson = reader.IsDBNull(reader.GetOrdinal("Language"))
                ? null
                : reader.GetString(reader.GetOrdinal("Language"));

            var jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

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

                Module = moduleJson is null
                    ? new ModuleModel
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("ModuleId")),
                        Name = "",
                        Slug = "",
                        CreatedAt = DateTime.MinValue,
                        UpdatedAt = DateTime.MinValue,
                    }
                    : JsonSerializer.Deserialize<ModuleModel>(moduleJson, jsonOptions)!,

                Language = languageJson is null
                    ? new LanguageModel
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("LanguageId")),
                        Code = "",
                        Name = "",
                        IsActive = true,
                        CreatedAt = DateTime.MinValue,
                        UpdatedAt = DateTime.MinValue,
                    }
                    : JsonSerializer.Deserialize<LanguageModel>(languageJson, jsonOptions)!,
            };

            results.Add(translation);
        }

        return results;
    }

    public async Task InsertTranslationAsync(InsertTranslationRequest translationDto)
    {
        using var connection = new SqlConnection(_config.ConnectionString);
        await connection.OpenAsync();

        var sql = new StringBuilder(
            @"INSERT INTO BTTranslations (ModuleId , LanguageId , KeyName , Value) 
            VALUES (@ModuleId , @LanguageId , @KeyName , @Value);"
        );

        using var cmd = new SqlCommand();
        cmd.Parameters.AddWithValue("ModuleId", translationDto.ModuleId);
        cmd.Parameters.AddWithValue("LanguageId", translationDto.LanguageId);
        cmd.Parameters.AddWithValue("KeyName", translationDto.KeyName);
        cmd.Parameters.AddWithValue("Value", translationDto.Value);

#if DEBUG
        Console.WriteLine(sql.ToString());
#endif

        cmd.Connection = connection;
        cmd.CommandText = sql.ToString();

        var rowsAffected = await cmd.ExecuteNonQueryAsync();

        if (rowsAffected <= 0)
        {
            throw new DataException(
                nameof(TranslationDataSource) + " Error inserting new translation in the database"
            );
        }
    }
}
