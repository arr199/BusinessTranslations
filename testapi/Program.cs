using Business.Translations.Extensions;

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
});

app.Run();
