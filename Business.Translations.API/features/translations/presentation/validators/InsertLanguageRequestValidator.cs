using Business.Translations.DTOs;
using FluentValidation;

namespace Business.Translations.Validators;

public class InsertLanguageRequestValidator : AbstractValidator<InsertLanguageRequest>
{
    public InsertLanguageRequestValidator()
    {
        RuleFor(d => d.Code).NotEmpty().MaximumLength(5);
        RuleFor(d => d.Name).NotEmpty().MaximumLength(50);
    }
}
