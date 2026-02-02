public class GetTranslationRequest
{
    public int? ModuleId { get; set; }
    public string? Keywords { get; set; }
    public int? LanguageId { get; set; }
    public int? Limit { get; set; } = 50;
    public int? Offset { get; set; } = 0;
}
