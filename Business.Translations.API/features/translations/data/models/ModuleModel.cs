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
