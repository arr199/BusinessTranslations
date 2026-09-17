using System.Data;
using Microsoft.Data.SqlClient;

namespace Business.Translations.API.Data;

public static class DatabaseSeeder
{
    public static async Task SeedDummyDataAsync(
        string connectionString,
        CancellationToken cancellationToken = default
    )
    {
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);

        Console.WriteLine("Seeding Database");

        // Minimal dummy seed (idempotent; guards match slug/code OR name so user
        // data with the same names but different slugs/codes never collides)
        const string sql =
            @"
IF NOT EXISTS (SELECT 1 FROM BTLanguages WHERE Code = N'en' OR Name = N'English')
    INSERT INTO BTLanguages (Code, Name, IsActive) VALUES (N'en', N'English', 1);
IF NOT EXISTS (SELECT 1 FROM BTLanguages WHERE Code = N'es' OR Name = N'Spanish')
    INSERT INTO BTLanguages (Code, Name, IsActive) VALUES (N'es', N'Spanish', 1);
IF NOT EXISTS (SELECT 1 FROM BTLanguages WHERE Code = N'fr' OR Name = N'French')
    INSERT INTO BTLanguages (Code, Name, IsActive) VALUES (N'fr', N'French', 1);

IF NOT EXISTS (SELECT 1 FROM BTModules WHERE Slug = N'common' OR Name = N'Common')
    INSERT INTO BTModules (Name, Slug, Icon, Description)
    VALUES (N'Common', N'common', N'globe', N'Common/shared UI strings');

IF NOT EXISTS (SELECT 1 FROM BTModules WHERE Slug = N'auth' OR Name = N'Authentication')
    INSERT INTO BTModules (Name, Slug, Icon, Description)
    VALUES (N'Authentication', N'auth', N'lock', N'Login/registration/identity strings');

DECLARE @moduleCommonId INT = (SELECT TOP 1 Id FROM BTModules WHERE Slug = N'common' OR Name = N'Common' ORDER BY Id);
DECLARE @moduleAuthId   INT = (SELECT TOP 1 Id FROM BTModules WHERE Slug = N'auth' OR Name = N'Authentication' ORDER BY Id);

DECLARE @langEnId INT = (SELECT TOP 1 Id FROM BTLanguages WHERE Code = N'en' OR Name = N'English' ORDER BY Id);
DECLARE @langEsId INT = (SELECT TOP 1 Id FROM BTLanguages WHERE Code = N'es' OR Name = N'Spanish' ORDER BY Id);
DECLARE @langFrId INT = (SELECT TOP 1 Id FROM BTLanguages WHERE Code = N'fr' OR Name = N'French' ORDER BY Id);

IF NOT EXISTS (SELECT 1 FROM BTTranslations WHERE ModuleId = @moduleCommonId AND KeyName = N'app.title' AND LanguageId = @langEnId)
    INSERT INTO BTTranslations (ModuleId, KeyName, LanguageId, Value, Status)
    VALUES (@moduleCommonId, N'app.title', @langEnId, N'Business Translations', N'approved');

IF NOT EXISTS (SELECT 1 FROM BTTranslations WHERE ModuleId = @moduleCommonId AND KeyName = N'app.title' AND LanguageId = @langEsId)
    INSERT INTO BTTranslations (ModuleId, KeyName, LanguageId, Value, Status)
    VALUES (@moduleCommonId, N'app.title', @langEsId, N'Traducciones Empresariales', N'approved');

IF NOT EXISTS (SELECT 1 FROM BTTranslations WHERE ModuleId = @moduleCommonId AND KeyName = N'app.title' AND LanguageId = @langFrId)
    INSERT INTO BTTranslations (ModuleId, KeyName, LanguageId, Value, Status)
    VALUES (@moduleCommonId, N'app.title', @langFrId, N'Traductions Métier', N'approved');

IF NOT EXISTS (SELECT 1 FROM BTTranslations WHERE ModuleId = @moduleAuthId AND KeyName = N'login.title' AND LanguageId = @langEnId)
    INSERT INTO BTTranslations (ModuleId, KeyName, LanguageId, Value, Status)
    VALUES (@moduleAuthId, N'login.title', @langEnId, N'Sign in', N'approved');

IF NOT EXISTS (SELECT 1 FROM BTTranslations WHERE ModuleId = @moduleAuthId AND KeyName = N'login.title' AND LanguageId = @langEsId)
    INSERT INTO BTTranslations (ModuleId, KeyName, LanguageId, Value, Status)
    VALUES (@moduleAuthId, N'login.title', @langEsId, N'Iniciar sesión', N'approved');

IF NOT EXISTS (SELECT 1 FROM BTTranslations WHERE ModuleId = @moduleAuthId AND KeyName = N'login.title' AND LanguageId = @langFrId)
    INSERT INTO BTTranslations (ModuleId, KeyName, LanguageId, Value, Status)
    VALUES (@moduleAuthId, N'login.title', @langFrId, N'Se connecter', N'approved');
";

        await using var cmd = new SqlCommand(sql, connection) { CommandType = CommandType.Text };

        await cmd.ExecuteNonQueryAsync(cancellationToken);
    }
}
