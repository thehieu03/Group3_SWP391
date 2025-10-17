using System.Net;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Mmo_Api;
using Xunit;

namespace Mmo_UnitTest.IntegrationTests;

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
