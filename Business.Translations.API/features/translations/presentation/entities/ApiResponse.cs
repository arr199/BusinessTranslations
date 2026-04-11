namespace Business.Translations.DTOs;

public class ApiResponse
{
    public required bool Success { get; set; }
    public required string Message { get; set; }
    public string? Error { get; set; }
}

public class ApiResponse<T> : ApiResponse
{
    public required T Data { get; set; }
}
