namespace Business.Translations.Configuration;

public interface IBTConfiguration
{
    /// <summary>
    /// The base path for the business translations endpoints (e.g. "bt" → /bt/dashboard).
    /// </summary>
    string BasePath { get; set; }
}
