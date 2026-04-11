namespace Business.Translations.DTOs;

public class UpdateTranslationRequest
{
    public required string Value { get; set; }
    public string? Status { get; set; }
}
