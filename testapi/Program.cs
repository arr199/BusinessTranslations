using businessTranslations.extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseBusinessTranslations(d =>
{
    d.ConnectionString =
        "Data Source=localhost\\SQLEXPRESS;Initial Catalog=TranslationsAPI;Integrated Security=True;Persist Security Info=False;Pooling=False;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=True;Command Timeout=0";
});

Console.WriteLine($"http://localhost:5100/bt/dashboard");
Console.WriteLine($"http://localhost:5100/bt/configure");
Console.WriteLine($"http://localhost:5100/bt/createTables");
Console.WriteLine($"http://localhost:5100/bt/translation");

app.Run();
