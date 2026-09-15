using Business.Translations.DTOs;
using Business.Translations.Validators;
using FluentValidation;

namespace Business.Translations.Services;

public static class ValidationService
{
    public static async Task ValidateAsync(InsertTranslationRequest data) =>
        await new InsertTranslationRequestValidator().ValidateAndThrowAsync(data);

    public static async Task ValidateAsync(BulkCreateTranslationsRequest data) =>
        await new BulkCreateTranslationsRequestValidator().ValidateAndThrowAsync(data);

    public static async Task ValidateAsync(GetTranslationRequest data) =>
        await new GetTranslationRequestValidator().ValidateAndThrowAsync(data);

    public static async Task ValidateAsync(UpdateTranslationRequest data) =>
        await new UpdateTranslationRequestValidator().ValidateAndThrowAsync(data);

    public static async Task ValidateAsync(InsertModuleRequest data) =>
        await new InsertModuleRequestValidator().ValidateAndThrowAsync(data);

    public static async Task ValidateAsync(UpdateModuleRequest data) =>
        await new UpdateModuleRequestValidator().ValidateAndThrowAsync(data);

    public static async Task ValidateAsync(InsertLanguageRequest data) =>
        await new InsertLanguageRequestValidator().ValidateAndThrowAsync(data);

    public static async Task ValidateAsync(UpdateLanguageRequest data) =>
        await new UpdateLanguageRequestValidator().ValidateAndThrowAsync(data);
}
