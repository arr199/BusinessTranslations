using System.Diagnostics;
using System.Text;
using businessTranslations.configuration;
using Microsoft.Data.SqlClient;

namespace Business.Translations.API.features.translations.data.datasource;

public class LanguageDataSource
{
    private readonly BTConfiguration _config;

    public LanguageDataSource(BTConfiguration config)
    {
        ArgumentNullException.ThrowIfNull(config);
        _config = config;
    }

    public async Task<List<LanguageModel>> GetLanguages()
    {
        using var connection = new SqlConnection(_config.ConnectionString);
        await connection.OpenAsync();

        var sql = new StringBuilder(
            @"
            SELECT
                Id,
                Code,
                Name,
                IsActive,
                CreatedAt,
                UpdatedAt
            FROM BTLanguages
            ORDER BY Name
            "
        );

        using var cmd = new SqlCommand(sql.ToString(), connection);
        await using var reader = await cmd.ExecuteReaderAsync();

        List<LanguageModel> results = [];

        while (await reader.ReadAsync())
        {
            results.Add(
                new LanguageModel
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    Code = reader.GetString(reader.GetOrdinal("Code")),
                    Name = reader.GetString(reader.GetOrdinal("Name")),
                    IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                    UpdatedAt = reader.GetDateTime(reader.GetOrdinal("UpdatedAt")),
                }
            );
        }

        return results;
    }
}
