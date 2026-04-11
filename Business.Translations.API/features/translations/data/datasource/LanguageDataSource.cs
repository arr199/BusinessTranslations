using System.Data;
using Business.Translations.API.features.translations.data.models;
using Business.Translations.Configuration;
using Business.Translations.DTOs;
using Microsoft.Data.SqlClient;

namespace Business.Translations.DataSources;

public class LanguageDataSource
{
    private readonly BTConfiguration _config;

    public LanguageDataSource(BTConfiguration config)
    {
        ArgumentNullException.ThrowIfNull(config);
        _config = config;
    }

    public async Task<List<LanguageModel>> GetLanguagesAsync()
    {
        using var connection = new SqlConnection(_config.ConnectionString);
        await connection.OpenAsync();

        const string sql =
            @"SELECT Id, Code, Name, IsActive, CreatedAt, UpdatedAt
              FROM BTLanguages ORDER BY Name";

        using var cmd = new SqlCommand(sql, connection);
        await using var reader = await cmd.ExecuteReaderAsync();

        List<LanguageModel> results = [];

        while (await reader.ReadAsync())
        {
            LanguageModel model = LanguageModel.FromSqlDataReader(reader);
            results.Add(model);
        }

        return results;
    }

    public async Task InsertLanguageAsync(InsertLanguageRequest dto)
    {
        using var connection = new SqlConnection(_config.ConnectionString);
        await connection.OpenAsync();

        const string sql =
            @"INSERT INTO BTLanguages (Code, Name, IsActive)
              VALUES (@Code, @Name, @IsActive);";

        using var cmd = new SqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("Code", dto.Code.Trim().ToLowerInvariant());
        cmd.Parameters.AddWithValue("Name", dto.Name.Trim());
        cmd.Parameters.AddWithValue("IsActive", true);

        var rowsAffected = await cmd.ExecuteNonQueryAsync();

        if (rowsAffected <= 0)
        {
            throw new DataException("Error inserting new language.");
        }
    }

    public async Task UpdateLanguageAsync(int id, UpdateLanguageRequest dto)
    {
        using var connection = new SqlConnection(_config.ConnectionString);
        await connection.OpenAsync();

        const string sql =
            @"UPDATE BTLanguages
              SET Code = @Code, Name = @Name, IsActive = @IsActive, UpdatedAt = GETUTCDATE()
              WHERE Id = @Id;";

        using var cmd = new SqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("Id", id);
        cmd.Parameters.AddWithValue("Code", dto.Code.Trim().ToLowerInvariant());
        cmd.Parameters.AddWithValue("Name", dto.Name.Trim());
        cmd.Parameters.AddWithValue("IsActive", dto.IsActive);

        var rowsAffected = await cmd.ExecuteNonQueryAsync();

        if (rowsAffected <= 0)
        {
            throw new DataException($"Language with Id {id} not found.");
        }
    }

    public async Task DeleteLanguageAsync(int id)
    {
        using var connection = new SqlConnection(_config.ConnectionString);
        await connection.OpenAsync();

        const string sql = "DELETE FROM BTLanguages WHERE Id = @Id;";

        using var cmd = new SqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("Id", id);

        var rowsAffected = await cmd.ExecuteNonQueryAsync();

        if (rowsAffected <= 0)
        {
            throw new DataException($"Language with Id {id} not found.");
        }
    }
}
