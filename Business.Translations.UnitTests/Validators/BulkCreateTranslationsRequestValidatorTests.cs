using Business.Translations.DTOs;
using Business.Translations.Validators;
using FluentAssertions;
using FluentValidation.TestHelper;

namespace Business.Translations.UnitTests.Validators;

public class BulkCreateTranslationsRequestValidatorTests
{
    private readonly BulkCreateTranslationsRequestValidator _validator = new();

    private static BulkTranslationRow Row(
        string module = "Auth",
        string keyName = "home.title",
        string languageCode = "en",
        string value = "Welcome"
    ) =>
        new()
        {
            Module = module,
            KeyName = keyName,
            LanguageCode = languageCode,
            Value = value,
        };

    [Fact]
    public void Valid_Request_Passes()
    {
        var request = new BulkCreateTranslationsRequest
        {
            Rows = [Row()],
        };

        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Empty_Rows_Fail()
    {
        var request = new BulkCreateTranslationsRequest
        {
            Rows = [],
        };

        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Rows);
    }

    [Fact]
    public void Exactly_10000_Rows_Pass()
    {
        var request = new BulkCreateTranslationsRequest
        {
            Rows = Enumerable.Range(0, 10000).Select(i => Row(keyName: $"k{i}")).ToArray(),
        };

        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void More_Than_10000_Rows_Fail()
    {
        var request = new BulkCreateTranslationsRequest
        {
            Rows = Enumerable.Range(0, 10001).Select(i => Row(keyName: $"k{i}")).ToArray(),
        };

        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Rows);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    [InlineData("   ")]
    public void Row_Module_Must_Not_Be_Empty(string? module)
    {
        var request = new BulkCreateTranslationsRequest
        {
            Rows = [Row(module: module!)],
        };

        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor("Rows[0].Module");
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Row_KeyName_Must_Not_Be_Empty(string? keyName)
    {
        var request = new BulkCreateTranslationsRequest
        {
            Rows = [Row(keyName: keyName!)],
        };

        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor("Rows[0].KeyName");
    }

    [Fact]
    public void Row_KeyName_Must_Not_Exceed_255_Chars()
    {
        var request = new BulkCreateTranslationsRequest
        {
            Rows = [Row(keyName: new string('a', 256))],
        };

        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor("Rows[0].KeyName");
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Row_LanguageCode_Must_Not_Be_Empty(string? languageCode)
    {
        var request = new BulkCreateTranslationsRequest
        {
            Rows = [Row(languageCode: languageCode!)],
        };

        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor("Rows[0].LanguageCode");
    }

    [Fact]
    public void Row_Value_May_Be_Empty()
    {
        var request = new BulkCreateTranslationsRequest
        {
            Rows = [Row(value: "")],
        };

        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }
}
