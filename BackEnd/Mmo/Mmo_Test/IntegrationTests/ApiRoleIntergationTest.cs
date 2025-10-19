using System.Net;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Mmo_Api;
using Xunit;

namespace Mmo_UnitTest.IntegrationTests;

// Make the Program class public to resolve the CS0122 error
public class ApiRoleIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ApiRoleIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Test1()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("api/role");
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}

// Make the Program class public to resolve the CS0051 error
public class Program
{
}
