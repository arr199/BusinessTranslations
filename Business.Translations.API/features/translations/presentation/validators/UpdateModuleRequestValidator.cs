using Business.Translations.DTOs;
using FluentValidation;

namespace Business.Translations.Validators;

public class UpdateModuleRequestValidator : AbstractValidator<UpdateModuleRequest>
{
    public UpdateModuleRequestValidator()
    {
        RuleFor(d => d.Name).NotEmpty().MaximumLength(100);
        RuleFor(d => d.Icon).MaximumLength(50);
    }
}
