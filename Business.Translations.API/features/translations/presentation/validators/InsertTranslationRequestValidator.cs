using Business.Translations.DTOs;
using FluentValidation;

namespace Business.Translations.Validators;

public class InsertTranslationRequestValidator : AbstractValidator<InsertTranslationRequest>
{
    public InsertTranslationRequestValidator()
    {
        RuleFor(d => d.LanguageId).GreaterThan(0);
        RuleFor(d => d.ModuleId).GreaterThan(0);
        RuleFor(d => d.KeyName).NotEmpty().MaximumLength(255);
        RuleFor(d => d.Value).NotEmpty();
    }
}
