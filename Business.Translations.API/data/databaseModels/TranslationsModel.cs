public class TranslationModel
{
    public required int Id { get; set; }
    public required int ModuleId { get; set; }
    public required int LanguageId { get; set; }
    public required string KeyName { get; set; }
    public required string Value { get; set; }
    public required string Status { get; set; }
    public required DateTime CreateAt { get; set; }
    public required DateTime UpdatedAt { get; set; }

    public required ModuleModel Module { get; set; }
    public required LanguageModel Language { get; set; }
}

public class ModuleModel
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required string Slug { get; set; }
    public string? Icon { get; set; }
    public string? Description { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}

public class LanguageModel
{
    public required int Id { get; set; }
    public required string Code { get; set; }
    public required string Name { get; set; }
    public required bool IsActive { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}
