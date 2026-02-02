using FluentValidation;

public class TranslationValidationService
{
    public async Task ValidateAsync(InsertTranslationRequest data)
    {
        var validator = new InsertTranslationRequestValidator();
        await validator.ValidateAndThrowAsync(data);
    }

    public async Task ValidateAsync(GetTranslationRequest data)
    {
        var validator = new GetTranslationRequestValidator();
        await validator.ValidateAndThrowAsync(data);
    }
}
