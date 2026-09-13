using Business.Translations.DTOs;
using Business.Translations.Validators;
using FluentValidation.TestHelper;

namespace Business.Translations.UnitTests.Validators;

public class ModuleRequestValidatorTests
{
    private readonly InsertModuleRequestValidator _insertValidator = new();
    private readonly UpdateModuleRequestValidator _updateValidator = new();

    [Fact]
    public void Insert_Valid_Request_Passes()
    {
        var request = new InsertModuleRequest { Name = "Auth" };
        _insertValidator.TestValidate(request).ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Insert_Name_Must_Not_Be_Empty(string? name)
    {
        var request = new InsertModuleRequest { Name = name! };
        _insertValidator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Insert_Name_Must_Not_Exceed_100_Chars()
    {
        var request = new InsertModuleRequest { Name = new string('a', 101) };
        _insertValidator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Insert_Icon_Must_Not_Exceed_50_Chars()
    {
        var request = new InsertModuleRequest { Name = "Auth", Icon = new string('i', 51) };
        _insertValidator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Icon);
    }

    [Fact]
    public void Update_Valid_Request_Passes()
    {
        var request = new UpdateModuleRequest { Name = "Auth" };
        _updateValidator.TestValidate(request).ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Update_Name_Must_Not_Be_Empty(string? name)
    {
        var request = new UpdateModuleRequest { Name = name! };
        _updateValidator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Update_Name_Must_Not_Exceed_100_Chars()
    {
        var request = new UpdateModuleRequest { Name = new string('a', 101) };
        _updateValidator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Update_Icon_Must_Not_Exceed_50_Chars()
    {
        var request = new UpdateModuleRequest { Name = "Auth", Icon = new string('i', 51) };
        _updateValidator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Icon);
    }
}
