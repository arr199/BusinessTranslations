using System.Data;
using System.Text.RegularExpressions;
using Business.Translations.API.features.translations.data.models;
using Business.Translations.Configuration;
using Business.Translations.DTOs;
using Microsoft.Data.SqlClient;

namespace Business.Translations.DataSources;

public partial class ModuleDataSource
{
    private readonly BTConfiguration _config;

    public ModuleDataSource(BTConfiguration config)
    {
        ArgumentNullException.ThrowIfNull(config);
        _config = config;
    }

    public async Task<List<ModuleModel>> GetModulesAsync()
    {
        using var connection = new SqlConnection(_config.ConnectionString);
        await connection.OpenAsync();

        const string sql =
            @"SELECT Id, Name, Slug, Icon, Description, CreatedAt, UpdatedAt
              FROM BTModules ORDER BY Name";

        using var cmd = new SqlCommand(sql, connection);
        await using var reader = await cmd.ExecuteReaderAsync();

        List<ModuleModel> results = [];

        while (await reader.ReadAsync())
        {
            var model = ModuleModel.FromSqlDataReader(reader);
            results.Add(model);
        }

        return results;
    }

    public async Task InsertModuleAsync(InsertModuleRequest dto)
    {
        using var connection = new SqlConnection(_config.ConnectionString);
        await connection.OpenAsync();

        const string sql =
            @"INSERT INTO BTModules (Name, Slug, Icon, Description)
              VALUES (@Name, @Slug, @Icon, @Description);";

        using var cmd = new SqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("Name", dto.Name);
        cmd.Parameters.AddWithValue("Slug", GenerateSlug(dto.Name));
        cmd.Parameters.AddWithValue("Icon", (object?)dto.Icon ?? DBNull.Value);
        cmd.Parameters.AddWithValue("Description", (object?)dto.Description ?? DBNull.Value);

        var rowsAffected = await cmd.ExecuteNonQueryAsync();

        if (rowsAffected <= 0)
        {
            throw new DataException("Error inserting new module.");
        }
    }

    public async Task UpdateModuleAsync(int id, UpdateModuleRequest dto)
    {
        using var connection = new SqlConnection(_config.ConnectionString);
        await connection.OpenAsync();

        const string sql =
            @"UPDATE BTModules
              SET Name = @Name, Slug = @Slug, Icon = @Icon, Description = @Description, UpdatedAt = GETUTCDATE()
              WHERE Id = @Id;";

        using var cmd = new SqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("Id", id);
        cmd.Parameters.AddWithValue("Name", dto.Name);
        cmd.Parameters.AddWithValue("Slug", GenerateSlug(dto.Name));
        cmd.Parameters.AddWithValue("Icon", (object?)dto.Icon ?? DBNull.Value);
        cmd.Parameters.AddWithValue("Description", (object?)dto.Description ?? DBNull.Value);

        var rowsAffected = await cmd.ExecuteNonQueryAsync();

        if (rowsAffected <= 0)
        {
            throw new DataException($"Module with Id {id} not found.");
        }
    }

    public async Task DeleteModuleAsync(int id)
    {
        using var connection = new SqlConnection(_config.ConnectionString);
        await connection.OpenAsync();

        const string sql = "DELETE FROM BTModules WHERE Id = @Id;";

        using var cmd = new SqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("Id", id);

        var rowsAffected = await cmd.ExecuteNonQueryAsync();

        if (rowsAffected <= 0)
        {
            throw new DataException($"Module with Id {id} not found.");
        }
    }

    private static string GenerateSlug(string name)
    {
        var slug = name.ToLowerInvariant().Trim();
        slug = SlugWhitespaceRegex().Replace(slug, "-");
        slug = SlugInvalidCharsRegex().Replace(slug, "");
        return slug;
    }

    [GeneratedRegex(@"\s+")]
    private static partial Regex SlugWhitespaceRegex();

    [GeneratedRegex(@"[^a-z0-9\-]")]
    private static partial Regex SlugInvalidCharsRegex();
}
