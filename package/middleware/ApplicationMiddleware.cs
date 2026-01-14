using Microsoft.AspNetCore.Http;

namespace businessTranslations.middleware;

public class ApplicationMiddleware
{
    private readonly RequestDelegate _next;
    private const string DASHBOARD_PATH = "/BusinessTranslation/Dashboard";

    public ApplicationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        if (context.Request.Path.StartsWithSegments(DASHBOARD_PATH))
        {
            await context.Response.WriteAsync(
                "<p>This is coming from a middleware in a package</p>"
            );
        }
        await _next(context);
    }
}
