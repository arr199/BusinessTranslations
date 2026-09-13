using Microsoft.Data.SqlClient;

namespace Business.Translations.API.features.translations.data.models;

public class LanguageModel
{
    public required int Id { get; set; }
    public required string Code { get; set; }
    public required string Name { get; set; }
    public required bool IsActive { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Creates a LanguageModel instance from a SqlDataReader.
    /// </summary>
    /// <param name="reader">The SqlDataReader containing the data.</param>
    /// <returns>A LanguageModel instance populated with data from the reader.</returns>
    public static LanguageModel FromSqlDataReader(SqlDataReader reader)
    {
        return new LanguageModel
        {
            Id = reader.GetInt32(reader.GetOrdinal("Id")),
            Code = reader.GetString(reader.GetOrdinal("Code")),
            Name = reader.GetString(reader.GetOrdinal("Name")),
            IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive")),
            CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
            UpdatedAt = reader.GetDateTime(reader.GetOrdinal("UpdatedAt")),
        };
    }
    
}
