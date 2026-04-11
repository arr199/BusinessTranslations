using Business.Translations.Extensions;
using testapi;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseBusinessTranslations(config =>
{
    config.UseSqlServer(
        builder.Configuration.GetConnectionString("TranslationsDb")
            ?? "Data Source=localhost\\SQLEXPRESS;Initial Catalog=TranslationsAPI;Integrated Security=True;Encrypt=True;TrustServerCertificate=True"
    );
    // protect all BT endpoints with a custom authorization filter:
    config.UseAuthorizationFilter(new AuthorizationEndpointFilter());
});

app.Run();
