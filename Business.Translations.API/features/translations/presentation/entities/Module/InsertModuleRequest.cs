namespace Business.Translations.DTOs;

public class InsertModuleRequest
{
    public required string Name { get; set; }
    public string? Icon { get; set; }
    public string? Description { get; set; }
}
