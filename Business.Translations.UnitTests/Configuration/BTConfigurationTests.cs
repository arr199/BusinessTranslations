using Business.Translations.Configuration;
using FluentAssertions;
using Microsoft.AspNetCore.Http;

namespace Business.Translations.UnitTests.Configuration;

public class BTConfigurationTests
{
    [Fact]
    public void Default_BasePath_Is_Bt()
    {
        var config = new BTConfiguration();
        config.BasePath.Should().Be("bt");
    }

    [Theory]
    [InlineData("api")]
    [InlineData("translations")]
    [InlineData("v1")]
    public void BasePath_Accepts_Alphanumeric(string path)
    {
        var config = new BTConfiguration { BasePath = path };
        config.BasePath.Should().Be(path);
    }

    [Theory]
    [InlineData("a/b")]
    [InlineData("a-b")]
    [InlineData("a b")]
    [InlineData("a.b")]
    public void BasePath_Rejects_NonAlphanumeric(string path)
    {
        var config = new BTConfiguration();
        var act = () => config.BasePath = path;
        act.Should().Throw<ArgumentException>();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void BasePath_Rejects_NullOrWhitespace(string? path)
    {
        var config = new BTConfiguration();
        var act = () => config.BasePath = path!;
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void UseSqlServer_Sets_ConnectionString_And_Provider()
    {
        var config = new BTConfiguration();
        var result = config.UseSqlServer("Server=localhost;Database=Test;");

        result.Should().BeSameAs(config);
        config.ConnectionString.Should().Be("Server=localhost;Database=Test;");
        config.Provider.Should().Be(DatabaseProvider.SqlServer);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void UseSqlServer_Rejects_NullOrWhitespace(string? connStr)
    {
        var config = new BTConfiguration();
        var act = () => config.UseSqlServer(connStr!);
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Default_Provider_Is_None()
    {
        var config = new BTConfiguration();
        config.Provider.Should().Be(DatabaseProvider.None);
    }

    [Fact]
    public void Default_AuthorizationFilter_Is_Null()
    {
        var config = new BTConfiguration();
        config.AuthorizationFilter.Should().BeNull();
    }

    [Fact]
    public void UseAuthorizationFilter_Sets_Filter()
    {
        var config = new BTConfiguration();
        var filter = new TestEndpointFilter();

        var result = config.UseAuthorizationFilter(filter);

        result.Should().BeSameAs(config);
        config.AuthorizationFilter.Should().BeSameAs(filter);
    }

    [Fact]
    public void UseAuthorizationFilter_Rejects_Null()
    {
        var config = new BTConfiguration();
        var act = () => config.UseAuthorizationFilter(null!);
        act.Should().Throw<ArgumentNullException>();
    }

    [Fact]
    public void Fluent_Api_Chains()
    {
        var filter = new TestEndpointFilter();
        var config = new BTConfiguration();

        config
            .UseSqlServer("Server=localhost;Database=Test;")
            .UseAuthorizationFilter(filter);

        config.Provider.Should().Be(DatabaseProvider.SqlServer);
        config.AuthorizationFilter.Should().BeSameAs(filter);
    }

    private class TestEndpointFilter : IEndpointFilter
    {
        public ValueTask<object?> InvokeAsync(
            EndpointFilterInvocationContext context,
            EndpointFilterDelegate next
        ) => next(context);
    }
}
