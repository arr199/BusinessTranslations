using System.Data;
using System.Text;
using System.Text.Json;
using Business.Translations.API.Data;
using Business.Translations.API.features.translations.data.models;
using Business.Translations.Configuration;
using Business.Translations.DTOs;
using Microsoft.Data.SqlClient;

namespace Business.Translations.DataSources;

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

        const string query =
            @"IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BTLanguages')
              BEGIN
                CREATE TABLE BTLanguages (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    Code NVARCHAR(5) UNIQUE NOT NULL,
                    Name NVARCHAR(50) UNIQUE NOT NULL,
                    IsActive BIT DEFAULT 1,
                    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
                    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
                );
                CREATE INDEX idx_btlang_code ON BTLanguages(Code);
                CREATE INDEX idx_btlang_active ON BTLanguages(IsActive);
              END;

              IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BTModules')
              BEGIN
                CREATE TABLE BTModules (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    Name NVARCHAR(100) UNIQUE NOT NULL,
                    Slug NVARCHAR(100) UNIQUE NOT NULL,
                    Icon NVARCHAR(50),
                    Description NVARCHAR(MAX),
                    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
                    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
                );
                CREATE INDEX idx_btmod_slug ON BTModules(Slug);
              END;

              IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BTTranslations')
              BEGIN
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
                CREATE INDEX idx_bttrans_module ON BTTranslations(ModuleId);
                CREATE INDEX idx_bttrans_lang ON BTTranslations(LanguageId);
                CREATE INDEX idx_bttrans_key ON BTTranslations(KeyName);
                CREATE INDEX idx_bttrans_status ON BTTranslations(Status);
              END;";

        using var cmd = new SqlCommand(query, connection);
        await cmd.ExecuteNonQueryAsync();

#if DEBUG
        await DatabaseSeeder.SeedDummyDataAsync(_config.ConnectionString, CancellationToken.None);
#endif
    }

    public async Task<(List<TranslationModel> Items, int TotalCount)> GetTranslationsAsync(
        GetTranslationRequest filters
    )
    {
        using var connection = new SqlConnection(_config.ConnectionString);
        await connection.OpenAsync();

        var whereClause = new StringBuilder();
        using var cmd = new SqlCommand();

        List<string> where = [];

        if (filters.ModuleId is not null)
        {
            where.Add("t.ModuleId = @ModuleId");
            cmd.Parameters.AddWithValue("ModuleId", filters.ModuleId);
        }

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
            whereClause.Append(" WHERE ");
            whereClause.Append(string.Join(" AND ", where));
        }

        var sql = new StringBuilder();

        // Count query
        sql.Append("SELECT COUNT(*) FROM BTTranslations t");
        sql.Append(" INNER JOIN BTModules m ON m.Id = t.ModuleId");
        sql.Append(" INNER JOIN BTLanguages l ON l.Id = t.LanguageId");
        sql.Append(whereClause);
        sql.Append(';');

        // Data query
        sql.Append(
            @"SELECT
                t.Id, t.ModuleId, t.LanguageId, t.KeyName,
                COALESCE(t.Value, N'') AS Value, t.Status, t.CreatedAt, t.UpdatedAt,
                JSON_QUERY((
                    SELECT m.Id, m.Name, m.Slug, m.Icon, m.Description, m.CreatedAt, m.UpdatedAt
                    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                )) AS Module,
                JSON_QUERY((
                    SELECT l.Id, l.Code, l.Name, l.IsActive, l.CreatedAt, l.UpdatedAt
                    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                )) AS Language
            FROM BTTranslations t
            INNER JOIN BTModules m ON m.Id = t.ModuleId
            INNER JOIN BTLanguages l ON l.Id = t.LanguageId"
        );
        sql.Append(whereClause);
        sql.Append(" ORDER BY t.KeyName ");
        sql.Append(" OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY");

        cmd.Parameters.AddWithValue("Offset", filters.Offset ?? 0);
        cmd.Parameters.AddWithValue("Limit", filters.Limit ?? 50);

        cmd.Connection = connection;
        cmd.CommandText = sql.ToString();

        await using var reader = await cmd.ExecuteReaderAsync();

        // Read count
        await reader.ReadAsync();
        var totalCount = reader.GetInt32(0);

        // Advance to data result set
        await reader.NextResultAsync();
        List<TranslationModel> results = [];

        while (await reader.ReadAsync())
        {
            var model = TranslationModel.FromSqlDataReader(reader);
            results.Add(model);
        }

        return (results, totalCount);
    }

    public async Task InsertTranslationAsync(InsertTranslationRequest dto)
    {
        using var connection = new SqlConnection(_config.ConnectionString);
        await connection.OpenAsync();

        const string sql =
            @"INSERT INTO BTTranslations (ModuleId, LanguageId, KeyName, Value)
              VALUES (@ModuleId, @LanguageId, @KeyName, @Value);";

        using var cmd = new SqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("ModuleId", dto.ModuleId);
        cmd.Parameters.AddWithValue("LanguageId", dto.LanguageId);
        cmd.Parameters.AddWithValue("KeyName", dto.KeyName);
        cmd.Parameters.AddWithValue("Value", dto.Value);

        var rowsAffected = await cmd.ExecuteNonQueryAsync();

        if (rowsAffected <= 0)
        {
            throw new DataException("Error inserting new translation.");
        }
    }

    public async Task<BulkImportSummary> BulkUpsertTranslationsAsync(
        BulkCreateTranslationsRequest dto
    )
    {
        using var connection = new SqlConnection(_config.ConnectionString);
        await connection.OpenAsync();

        var summary = new BulkImportSummary();

        // Resolve lookups once — modules by name, languages by code
        var modules = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        await using (var modulesCmd = new SqlCommand(
            "SELECT Name, Id FROM BTModules",
            connection
        ))
        await using (var reader = await modulesCmd.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                modules[reader.GetString(0)] = reader.GetInt32(1);
            }
        }

        var languages = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        await using (var languagesCmd = new SqlCommand(
            "SELECT Code, Id FROM BTLanguages",
            connection
        ))
        await using (var reader = await languagesCmd.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                languages[reader.GetString(0)] = reader.GetInt32(1);
            }
        }

        foreach (var row in dto.Rows)
        {
            if (!modules.TryGetValue(row.Module, out var moduleId))
            {
                summary.Skipped.Add(new TranslationRowOutcome
                {
                    Key = row.KeyName,
                    Reason = $"Module '{row.Module}' not found.",
                });
                continue;
            }

            if (!languages.TryGetValue(row.LanguageCode, out var languageId))
            {
                summary.Skipped.Add(new TranslationRowOutcome
                {
                    Key = row.KeyName,
                    Reason = $"Language '{row.LanguageCode}' not found.",
                });
                continue;
            }

            try
            {
                // Upsert on the unique key (ModuleId, KeyName, LanguageId):
                // update when present, insert when missing.
                const string upsertSql =
                    @"DECLARE @Action NVARCHAR(10);

                      UPDATE BTTranslations
                      SET Value = @Value, UpdatedAt = GETUTCDATE()
                      WHERE ModuleId = @ModuleId
                        AND KeyName = @KeyName
                        AND LanguageId = @LanguageId;

                      IF @@ROWCOUNT = 0
                      BEGIN
                          INSERT INTO BTTranslations (ModuleId, LanguageId, KeyName, Value)
                          VALUES (@ModuleId, @LanguageId, @KeyName, @Value);
                          SET @Action = 'created';
                      END
                      ELSE
                          SET @Action = 'updated';

                      SELECT @Action AS Outcome;";

                using var cmd = new SqlCommand(upsertSql, connection);
                cmd.Parameters.AddWithValue("ModuleId", moduleId);
                cmd.Parameters.AddWithValue("LanguageId", languageId);
                cmd.Parameters.AddWithValue("KeyName", row.KeyName);
                cmd.Parameters.AddWithValue("Value", row.Value);

                var outcome = (string?)(await cmd.ExecuteScalarAsync());
                if (outcome == "created")
                {
                    summary.Created++;
                }
                else
                {
                    summary.Updated++;
                }
            }
            catch (Exception)
            {
                summary.Failed.Add(new TranslationRowOutcome
                {
                    Key = row.KeyName,
                    Reason = "Unexpected database error while upserting the row.",
                });
            }
        }

        return summary;
    }

    public async Task UpdateTranslationAsync(int id, UpdateTranslationRequest dto)
    {
        using var connection = new SqlConnection(_config.ConnectionString);
        await connection.OpenAsync();

        const string sql =
            @"UPDATE BTTranslations
              SET Value = @Value, Status = @Status, UpdatedAt = GETUTCDATE()
              WHERE Id = @Id;";

        using var cmd = new SqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("Id", id);
        cmd.Parameters.AddWithValue("Value", dto.Value);
        cmd.Parameters.AddWithValue("Status", dto.Status ?? "pending");

        var rowsAffected = await cmd.ExecuteNonQueryAsync();

        if (rowsAffected <= 0)
        {
            throw new DataException($"Translation with Id {id} not found.");
        }
    }

    public async Task DeleteTranslationAsync(int id)
    {
        using var connection = new SqlConnection(_config.ConnectionString);
        await connection.OpenAsync();

        const string sql = "DELETE FROM BTTranslations WHERE Id = @Id;";

        using var cmd = new SqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("Id", id);

        var rowsAffected = await cmd.ExecuteNonQueryAsync();

        if (rowsAffected <= 0)
        {
            throw new DataException($"Translation with Id {id} not found.");
        }
    }

    public async Task<int> DeleteTranslationsAsync(int[] ids)
    {
        if (ids.Length == 0)
            return 0;

        using var connection = new SqlConnection(_config.ConnectionString);
        await connection.OpenAsync();

        var parameters = ids.Select((id, i) => $"@Id{i}").ToArray();

        var sql = $"DELETE FROM BTTranslations WHERE Id IN ({string.Join(",", parameters)});";

        using var cmd = new SqlCommand(sql, connection);
        for (var i = 0; i < ids.Length; i++)
        {
            cmd.Parameters.AddWithValue($"Id{i}", ids[i]);
        }

        return await cmd.ExecuteNonQueryAsync();
    }
}
