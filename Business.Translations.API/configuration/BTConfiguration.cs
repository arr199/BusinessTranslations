using System.Text.RegularExpressions;

namespace businessTranslations.configuration;

public class BTConfiguration : IBTConfiguration
{
    private string _basePath = "bt";

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

    public bool UseSql { get; set; } = true;
}
