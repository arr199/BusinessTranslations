using Business.Translations.DTOs;
using FluentValidation;

namespace Business.Translations.Validators;

public class InsertModuleRequestValidator : AbstractValidator<InsertModuleRequest>
{
    public InsertModuleRequestValidator()
    {
        RuleFor(d => d.Name).NotEmpty().MaximumLength(100);
        RuleFor(d => d.Icon).MaximumLength(50);
    }
}
