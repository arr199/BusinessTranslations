using System.Diagnostics;
using System.Text;
using businessTranslations.configuration;
using Microsoft.Data.SqlClient;

namespace Business.Translations.API.features.translations.data.datasource;

public class ModuleDataSource
{
    private readonly BTConfiguration _config;

    public ModuleDataSource(BTConfiguration config)
    {
        ArgumentNullException.ThrowIfNull(config);
        _config = config;
    }

    public async Task<List<ModuleModel>> GetModules()
    {
        using var connection = new SqlConnection(_config.ConnectionString);
        await connection.OpenAsync();

        var sql = new StringBuilder(
            @"
            SELECT
                Id,
                Name,
                Slug,
                Icon,
                Description,
                CreatedAt,
                UpdatedAt
            FROM BTModules
            ORDER BY Name
            "
        );

        using var cmd = new SqlCommand(sql.ToString(), connection);
        await using var reader = await cmd.ExecuteReaderAsync();

        List<ModuleModel> results = [];

        while (await reader.ReadAsync())
        {
            results.Add(
                new ModuleModel
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    Name = reader.GetString(reader.GetOrdinal("Name")),
                    Slug = reader.GetString(reader.GetOrdinal("Slug")),
                    Icon = reader.IsDBNull(reader.GetOrdinal("Icon"))
                        ? null
                        : reader.GetString(reader.GetOrdinal("Icon")),
                    Description = reader.IsDBNull(reader.GetOrdinal("Description"))
                        ? null
                        : reader.GetString(reader.GetOrdinal("Description")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                    UpdatedAt = reader.GetDateTime(reader.GetOrdinal("UpdatedAt")),
                }
            );
        }

        return results;
    }
}
