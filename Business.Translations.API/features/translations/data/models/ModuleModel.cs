using Microsoft.Data.SqlClient;

namespace Business.Translations.API.features.translations.data.models;

public class ModuleModel
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required string Slug { get; set; }
    public string? Icon { get; set; }
    public string? Description { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Creates a ModuleModel instance from a SqlDataReader.
    /// </summary>
    /// <param name="reader">The SqlDataReader containing the data.</param>
    /// <returns>A ModuleModel instance populated with data from the reader.</returns>
    public static ModuleModel FromSqlDataReader(SqlDataReader reader)
    {
        return new ModuleModel
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
        };
    }
}
