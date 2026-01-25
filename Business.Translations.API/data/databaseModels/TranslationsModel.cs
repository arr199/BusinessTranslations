public class TranslationModel
{
    public int Id { get; set; }
    public int ModuleId { get; set; }
    public int LanguageId { get; set; }
    public string KeyName { get; set; }
    public string Value { get; set; }
    public string Status { get; set; }
    public DateTime CreateAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
