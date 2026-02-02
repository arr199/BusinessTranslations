using System.Text.RegularExpressions;

namespace businessTranslations.configuration;

public class BTConfiguration : IBTConfiguration
{
    private string _basePath = "bt";
    private string _connectionString = string.Empty;

    public string BasePath
    {
        get => _basePath;
        set
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(value, nameof(BasePath));

            Regex reg = new("^[a-zA-Z0-9]+$");

            if (!reg.IsMatch(value))
            {
                throw new ArgumentNullException(
                    nameof(BasePath),
                    "must contain only letters and numbers"
                );
            }

            _basePath = value;
        }
    }

    public string ConnectionString
    {
        get => _connectionString;
        set
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(value, nameof(ConnectionString));
            _connectionString = value;
        }
    }

    public bool UseSql { get; set; } = true;
}
