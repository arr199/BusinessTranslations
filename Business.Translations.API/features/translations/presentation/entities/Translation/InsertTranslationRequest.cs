namespace Business.Translations.DTOs;

public class InsertTranslationRequest
{
    public required int ModuleId { get; set; }
    public required int LanguageId { get; set; }
    public required string KeyName { get; set; }
    public required string Value { get; set; }
}
