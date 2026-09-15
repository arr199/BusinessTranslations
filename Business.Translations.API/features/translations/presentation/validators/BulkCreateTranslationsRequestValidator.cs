using Business.Translations.DTOs;
using FluentValidation;

namespace Business.Translations.Validators;

public class BulkCreateTranslationsRequestValidator
    : AbstractValidator<BulkCreateTranslationsRequest>
{
    public BulkCreateTranslationsRequestValidator()
    {
        RuleFor(d => d.Rows).NotEmpty();
        RuleFor(d => d.Rows)
            .Must(rows => rows.Length <= 10000)
            .WithMessage("Bulk import is limited to 10000 rows per request.");
        RuleForEach(d => d.Rows).ChildRules(row =>
        {
            row.RuleFor(r => r.Module).NotEmpty();
            row.RuleFor(r => r.KeyName).NotEmpty().MaximumLength(255);
            row.RuleFor(r => r.LanguageCode).NotEmpty().MaximumLength(5);
            row.RuleFor(r => r.Value).NotNull();
        });
    }
}
