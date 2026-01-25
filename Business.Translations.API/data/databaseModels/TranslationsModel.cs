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
}
