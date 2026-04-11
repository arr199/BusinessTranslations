using System.Text.RegularExpressions;

namespace Business.Translations.Configuration;

public partial class BTConfiguration : IBTConfiguration
{
    private string _basePath = "bt";
    private string _connectionString = string.Empty;

    public string BasePath
    {
        get => _basePath;
        set
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(value, nameof(BasePath));

            if (!AlphanumericRegex().IsMatch(value))
            {
                throw new ArgumentException(
                    "BasePath must contain only letters and numbers.",
                    nameof(BasePath)
                );
            }

            _basePath = value;
        }
    }

    public string ConnectionString
    {
        get => _connectionString;
        internal set
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(value, nameof(ConnectionString));
            _connectionString = value;
        }
    }

    public DatabaseProvider Provider { get; internal set; } = DatabaseProvider.None;

    /// <summary>
    /// Configure the package to use SQL Server as the database provider.
    /// </summary>
    public BTConfiguration UseSqlServer(string connectionString)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(connectionString, nameof(connectionString));
        ConnectionString = connectionString;
        Provider = DatabaseProvider.SqlServer;
        return this;
    }

    [GeneratedRegex("^[a-zA-Z0-9]+$")]
    private static partial Regex AlphanumericRegex();
}

public enum DatabaseProvider
{
    None,
    SqlServer,
}
