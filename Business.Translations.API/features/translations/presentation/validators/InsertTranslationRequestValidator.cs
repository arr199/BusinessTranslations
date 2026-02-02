using FluentValidation;

public class InsertTranslationRequestValidator : AbstractValidator<InsertTranslationRequest>
{
    public InsertTranslationRequestValidator()
    {
        RuleFor(d => d.LanguageId).NotEmpty();
        RuleFor(d => d.ModuleId).NotEmpty();
        RuleFor(d => d.KeyName).NotEmpty();
        RuleFor(d => d.Value).NotEmpty();
    }
}
