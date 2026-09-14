using Microsoft.AspNetCore.Http;

namespace Business.Translations.SampleApp;

/// <summary>
/// Example endpoint filter that checks authorization before allowing access.
/// </summary>
public class AuthorizationEndpointFilter : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(
        EndpointFilterInvocationContext context,
        EndpointFilterDelegate next
    )
    {
        // var user = context.HttpContext.User;

        // if (user.Identity?.IsAuthenticated != true || !user.IsInRole("Admin"))
        // {
        //     return Results.Json(
        //         new { success = false, message = "Unauthorized." },
        //         statusCode: StatusCodes.Status401Unauthorized
        //     );
        // }

        return await next(context);
    }

}

