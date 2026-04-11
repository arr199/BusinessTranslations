namespace Business.Translations.DTOs;

public class UpdateLanguageRequest
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public bool IsActive { get; set; } = true;
}
