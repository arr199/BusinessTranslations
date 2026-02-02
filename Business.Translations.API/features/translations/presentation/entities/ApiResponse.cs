public class ApiResponse()
{
    public required bool Success { get; set; }
    public required string Message { get; set; }
    public required string? Error { get; set; }
}
