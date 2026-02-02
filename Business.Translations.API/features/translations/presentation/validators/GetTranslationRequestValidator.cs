using FluentValidation;

public class GetTranslationRequestValidator : AbstractValidator<GetTranslationRequest>
{
    public GetTranslationRequestValidator()
    {
        RuleFor(d => d.LanguageId).LessThan(int.MaxValue);
        RuleFor(d => d.ModuleId).LessThan(int.MaxValue);
        RuleFor(d => d.Keywords).MaximumLength(500);
        RuleFor(d => d.Limit).LessThan(51);
        RuleFor(d => d.Offset);
    }
}
