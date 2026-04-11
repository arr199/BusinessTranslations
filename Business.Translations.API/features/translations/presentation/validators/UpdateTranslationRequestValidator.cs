using Business.Translations.DTOs;
using FluentValidation;

namespace Business.Translations.Validators;

public class UpdateTranslationRequestValidator : AbstractValidator<UpdateTranslationRequest>
{
    private static readonly string[] ValidStatuses = ["pending", "approved", "verified", "missing"];

    public UpdateTranslationRequestValidator()
    {
        RuleFor(d => d.Value).NotNull();
        RuleFor(d => d.Status)
            .Must(s => s is null || ValidStatuses.Contains(s.ToLowerInvariant()))
            .WithMessage("Status must be one of: pending, approved, verified, missing.");
    }
}
