using Business.Translations.DTOs;
using Business.Translations.Validators;
using FluentValidation.TestHelper;

namespace Business.Translations.UnitTests.Validators;

public class LanguageRequestValidatorTests
{
    private readonly InsertLanguageRequestValidator _insertValidator = new();
    private readonly UpdateLanguageRequestValidator _updateValidator = new();

    [Fact]
    public void Insert_Valid_Request_Passes()
    {
        var request = new InsertLanguageRequest { Code = "en", Name = "English" };
        _insertValidator.TestValidate(request).ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Insert_Code_Must_Not_Be_Empty(string? code)
    {
        var request = new InsertLanguageRequest { Code = code!, Name = "English" };
        _insertValidator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Code);
    }

    [Fact]
    public void Insert_Code_Must_Not_Exceed_5_Chars()
    {
        var request = new InsertLanguageRequest { Code = "en-US1", Name = "English" };
        _insertValidator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Code);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Insert_Name_Must_Not_Be_Empty(string? name)
    {
        var request = new InsertLanguageRequest { Code = "en", Name = name! };
        _insertValidator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Insert_Name_Must_Not_Exceed_50_Chars()
    {
        var request = new InsertLanguageRequest { Code = "en", Name = new string('a', 51) };
        _insertValidator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Update_Valid_Request_Passes()
    {
        var request = new UpdateLanguageRequest { Code = "en", Name = "English" };
        _updateValidator.TestValidate(request).ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Update_Code_Must_Not_Be_Empty(string? code)
    {
        var request = new UpdateLanguageRequest { Code = code!, Name = "English" };
        _updateValidator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Code);
    }

    [Fact]
    public void Update_Code_Must_Not_Exceed_5_Chars()
    {
        var request = new UpdateLanguageRequest { Code = "en-US1", Name = "English" };
        _updateValidator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Code);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Update_Name_Must_Not_Be_Empty(string? name)
    {
        var request = new UpdateLanguageRequest { Code = "en", Name = name! };
        _updateValidator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Update_Name_Must_Not_Exceed_50_Chars()
    {
        var request = new UpdateLanguageRequest { Code = "en", Name = new string('a', 51) };
        _updateValidator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Name);
    }
}
