using Business.Translations.DTOs;
using Business.Translations.Validators;
using FluentValidation.TestHelper;

namespace Business.Translations.UnitTests.Validators;

public class GetTranslationRequestValidatorTests
{
    private readonly GetTranslationRequestValidator _validator = new();

    [Fact]
    public void Default_Request_Passes()
    {
        var request = new GetTranslationRequest();
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Null_Optional_Fields_Pass()
    {
        var request = new GetTranslationRequest
        {
            ModuleId = null,
            LanguageId = null,
            Keywords = null,
        };
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public void ModuleId_When_Present_Must_Be_Positive(int moduleId)
    {
        var request = new GetTranslationRequest { ModuleId = moduleId };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.ModuleId);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void LanguageId_When_Present_Must_Be_Positive(int languageId)
    {
        var request = new GetTranslationRequest { LanguageId = languageId };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.LanguageId);
    }

    [Fact]
    public void Keywords_Must_Not_Exceed_500_Chars()
    {
        var request = new GetTranslationRequest { Keywords = new string('x', 501) };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Keywords);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(251)]
    public void Limit_Must_Be_Between_1_And_250(int limit)
    {
        var request = new GetTranslationRequest { Limit = limit };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Limit);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(-100)]
    public void Offset_Must_Be_Non_Negative(int offset)
    {
        var request = new GetTranslationRequest { Offset = offset };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Offset);
    }
}
