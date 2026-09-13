using Business.Translations.DTOs;
using Business.Translations.Validators;
using FluentAssertions;
using FluentValidation.TestHelper;

namespace Business.Translations.UnitTests.Validators;

public class InsertTranslationRequestValidatorTests
{
    private readonly InsertTranslationRequestValidator _validator = new();

    [Fact]
    public void Valid_Request_Passes()
    {
        var request = new InsertTranslationRequest
        {
            ModuleId = 1,
            LanguageId = 1,
            KeyName = "home.title",
            Value = "Welcome",
        };

        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void ModuleId_Must_Be_Positive(int moduleId)
    {
        var request = new InsertTranslationRequest
        {
            ModuleId = moduleId,
            LanguageId = 1,
            KeyName = "key",
            Value = "val",
        };

        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.ModuleId);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void LanguageId_Must_Be_Positive(int languageId)
    {
        var request = new InsertTranslationRequest
        {
            ModuleId = 1,
            LanguageId = languageId,
            KeyName = "key",
            Value = "val",
        };

        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.LanguageId);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void KeyName_Must_Not_Be_Empty(string? keyName)
    {
        var request = new InsertTranslationRequest
        {
            ModuleId = 1,
            LanguageId = 1,
            KeyName = keyName!,
            Value = "val",
        };

        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.KeyName);
    }

    [Fact]
    public void KeyName_Must_Not_Exceed_255_Chars()
    {
        var request = new InsertTranslationRequest
        {
            ModuleId = 1,
            LanguageId = 1,
            KeyName = new string('a', 256),
            Value = "val",
        };

        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.KeyName);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Value_Must_Not_Be_Empty(string? value)
    {
        var request = new InsertTranslationRequest
        {
            ModuleId = 1,
            LanguageId = 1,
            KeyName = "key",
            Value = value!,
        };

        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Value);
    }
}
