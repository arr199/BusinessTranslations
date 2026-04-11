using Business.Translations.DTOs;
using FluentValidation;

namespace Business.Translations.Validators;

public class UpdateLanguageRequestValidator : AbstractValidator<UpdateLanguageRequest>
{
    public UpdateLanguageRequestValidator()
    {
        RuleFor(d => d.Code).NotEmpty().MaximumLength(5);
        RuleFor(d => d.Name).NotEmpty().MaximumLength(50);
    }
}
