using businessTranslations;
using businessTranslations.middleware;
using Microsoft.AspNetCore.Builder;

namespace businessTranslations.extensions;

public static class ApplicationMiddlewareExtension
{
    public static IApplicationBuilder UseBusinessTranslations(this IApplicationBuilder app)
    {
        return app.UseMiddleware<ApplicationMiddleware>();
    }
}
