using Business.Translations.DTOs;
using FluentValidation;

namespace Business.Translations.Validators;

public class GetTranslationRequestValidator : AbstractValidator<GetTranslationRequest>
{
    public GetTranslationRequestValidator()
    {
        RuleFor(d => d.LanguageId).GreaterThan(0).When(d => d.LanguageId is not null);
        RuleFor(d => d.ModuleId).GreaterThan(0).When(d => d.ModuleId is not null);
        RuleFor(d => d.Keywords).MaximumLength(500);
        RuleFor(d => d.Limit).InclusiveBetween(1, 250);
        RuleFor(d => d.Offset).GreaterThanOrEqualTo(0);
    }
}
