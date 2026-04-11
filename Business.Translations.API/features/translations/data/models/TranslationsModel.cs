using System.Text.Json;
using Microsoft.Data.SqlClient;

namespace Business.Translations.API.features.translations.data.models;

public class TranslationModel
{
    public required int Id { get; set; }
    public required int ModuleId { get; set; }
    public required int LanguageId { get; set; }
    public required string KeyName { get; set; }
    public required string Value { get; set; }
    public required string Status { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
    public required ModuleModel Module { get; set; }
    public required LanguageModel Language { get; set; }

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    /// <summary>
    /// Creates a TranslationModel instance from a SqlDataReader.
    /// </summary>
    /// <param name="reader">The SqlDataReader containing the data.</param>
    /// <returns>A TranslationModel instance populated with data from the reader.</returns>
    public static TranslationModel FromSqlDataReader(SqlDataReader reader)
    {
        var moduleJson = reader.IsDBNull(reader.GetOrdinal("Module"))
            ? null
            : reader.GetString(reader.GetOrdinal("Module"));
        var languageJson = reader.IsDBNull(reader.GetOrdinal("Language"))
            ? null
            : reader.GetString(reader.GetOrdinal("Language"));

        return new TranslationModel
        {
            Id = reader.GetInt32(reader.GetOrdinal("Id")),
            ModuleId = reader.GetInt32(reader.GetOrdinal("ModuleId")),
            LanguageId = reader.GetInt32(reader.GetOrdinal("LanguageId")),
            KeyName = reader.GetString(reader.GetOrdinal("KeyName")),
            Value = reader.GetString(reader.GetOrdinal("Value")),
            Status = reader.GetString(reader.GetOrdinal("Status")),
            CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
            UpdatedAt = reader.GetDateTime(reader.GetOrdinal("UpdatedAt")),
            Module = moduleJson is not null
                ? JsonSerializer.Deserialize<ModuleModel>(moduleJson, JsonOptions)!
                : new ModuleModel
                {
                    Id = reader.GetInt32(reader.GetOrdinal("ModuleId")),
                    Name = "",
                    Slug = "",
                    CreatedAt = DateTime.MinValue,
                    UpdatedAt = DateTime.MinValue,
                },
            Language = languageJson is not null
                ? JsonSerializer.Deserialize<LanguageModel>(languageJson, JsonOptions)!
                : new LanguageModel
                {
                    Id = reader.GetInt32(reader.GetOrdinal("LanguageId")),
                    Code = "",
                    Name = "",
                    IsActive = true,
                    CreatedAt = DateTime.MinValue,
                    UpdatedAt = DateTime.MinValue,
                },
        };
    }
}
