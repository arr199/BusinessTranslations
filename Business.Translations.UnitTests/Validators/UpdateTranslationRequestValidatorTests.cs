using Business.Translations.DTOs;
using Business.Translations.Validators;
using FluentValidation.TestHelper;

namespace Business.Translations.UnitTests.Validators;

public class UpdateTranslationRequestValidatorTests
{
    private readonly UpdateTranslationRequestValidator _validator = new();

    [Fact]
    public void Valid_Request_Passes()
    {
        var request = new UpdateTranslationRequest { Value = "Updated value" };
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Valid_Request_With_Status_Passes()
    {
        var request = new UpdateTranslationRequest { Value = "Updated", Status = "verified" };
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Value_Must_Not_Be_Null()
    {
        var request = new UpdateTranslationRequest { Value = null! };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Value);
    }

    [Theory]
    [InlineData("pending")]
    [InlineData("approved")]
    [InlineData("verified")]
    [InlineData("missing")]
    public void Valid_Statuses_Pass(string status)
    {
        var request = new UpdateTranslationRequest { Value = "v", Status = status };
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveValidationErrorFor(x => x.Status);
    }

    [Theory]
    [InlineData("invalid")]
    [InlineData("done")]
    [InlineData("UNKNOWN")]
    public void Invalid_Statuses_Fail(string status)
    {
        var request = new UpdateTranslationRequest { Value = "v", Status = status };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Status);
    }

    [Fact]
    public void Null_Status_Is_Allowed()
    {
        var request = new UpdateTranslationRequest { Value = "v", Status = null };
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveValidationErrorFor(x => x.Status);
    }
}
