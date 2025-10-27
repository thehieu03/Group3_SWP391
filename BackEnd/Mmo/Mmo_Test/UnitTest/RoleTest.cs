namespace Mmo_UnitTest.UnitTest;

using AutoMapper;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Mmo_Api.ApiController;
using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelRequest;
using Mmo_Domain.Models;
using Xunit;

public class RoleTest
{
    private static RoleController CreateController(
        Mock<IRoleServices>? roleServicesMock = null,
        IMapper? mapper = null)
    {
        roleServicesMock ??= new Mock<IRoleServices>(MockBehavior.Strict);

        // Configure minimal AutoMapper for RoleRequest -> Role mapping
        if (mapper == null)
        {
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.CreateMap<RoleRequest, Role>();
            });
            mapper = mapperConfig.CreateMapper();
        }

        return new RoleController(roleServicesMock.Object, mapper);
    }

    [Fact]
    public async Task Get_ShouldReturnOk_WithRoles()
    {
        // Arrange
        var roles = new List<Role>
        {
            new Role { Id = 1, RoleName = "Admin" },
            new Role { Id = 2, RoleName = "User" }
        } as IEnumerable<Role>;

        var roleServicesMock = new Mock<IRoleServices>(MockBehavior.Strict);
        roleServicesMock
            .Setup(s => s.GetAllAsync())
            .ReturnsAsync(roles);

        var controller = CreateController(roleServicesMock);

        // Act
        var actionResult = await controller.Get();

        // Assert
        actionResult.Result.Should().BeOfType<OkObjectResult>();
        var ok = actionResult.Result as OkObjectResult;
        ok!.Value.Should().BeEquivalentTo(roles);

        roleServicesMock.VerifyAll();
    }

    [Fact]
    public async Task Get_ShouldReturnBadRequest_WhenServiceReturnsNull()
    {
        // Arrange
        var roleServicesMock = new Mock<IRoleServices>(MockBehavior.Strict);
        roleServicesMock
            .Setup(s => s.GetAllAsync())
            .ReturnsAsync((IEnumerable<Role>?)null);

        var controller = CreateController(roleServicesMock);

        // Act
        var actionResult = await controller.Get();

        // Assert
        actionResult.Result.Should().BeOfType<BadRequestResult>();
        roleServicesMock.VerifyAll();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task GetById_ShouldReturnBadRequest_ForInvalidId(int id)
    {
        // Arrange
        var controller = CreateController();

        // Act
        var actionResult = await controller.GetById(id);

        // Assert
        actionResult.Result.Should().BeOfType<BadRequestObjectResult>();
        var bad = actionResult.Result as BadRequestObjectResult;
        bad!.Value.Should().Be("Invalid ID");
    }

    [Fact]
    public async Task GetById_ShouldReturnNotFound_WhenRoleMissing()
    {
        // Arrange
        var roleServicesMock = new Mock<IRoleServices>(MockBehavior.Strict);
        roleServicesMock
            .Setup(s => s.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((Role?)null);

        var controller = CreateController(roleServicesMock);

        // Act
        var actionResult = await controller.GetById(10);

        // Assert
        actionResult.Result.Should().BeOfType<NotFoundObjectResult>();
        var notFound = actionResult.Result as NotFoundObjectResult;
        notFound!.Value.Should().Be("Role with ID 10 not found.");

        roleServicesMock.VerifyAll();
    }

    [Fact]
    public async Task GetById_ShouldReturnOk_WithRole()
    {
        // Arrange
        var role = new Role { Id = 5, RoleName = "Manager" };
        var roleServicesMock = new Mock<IRoleServices>(MockBehavior.Strict);
        roleServicesMock
            .Setup(s => s.GetByIdAsync(5))
            .ReturnsAsync(role);

        var controller = CreateController(roleServicesMock);

        // Act
        var actionResult = await controller.GetById(5);

        // Assert
        actionResult.Result.Should().BeOfType<OkObjectResult>();
        var ok = actionResult.Result as OkObjectResult;
        ok!.Value.Should().BeEquivalentTo(role);

        roleServicesMock.VerifyAll();
    }

    [Fact]
    public async Task Create_ShouldReturnBadRequest_WhenModelInvalid()
    {
        // Arrange
        var controller = CreateController();
        controller.ModelState.AddModelError("RoleName", "Required");
        var request = new RoleRequest { RoleName = string.Empty };

        // Act
        var actionResult = await controller.Create(request);

        // Assert
        actionResult.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task Create_ShouldReturnOk_WhenCreated()
    {
        // Arrange
        var roleServicesMock = new Mock<IRoleServices>(MockBehavior.Strict);
        roleServicesMock
            .Setup(s => s.AddAsync(It.Is<Role>(r => r.RoleName == "NewRole")))
            .ReturnsAsync(1);

        var controller = CreateController(roleServicesMock);
        var request = new RoleRequest { RoleName = "NewRole" };

        // Act
        var actionResult = await controller.Create(request);

        // Assert
        actionResult.Result.Should().BeOfType<OkObjectResult>();
        var ok = actionResult.Result as OkObjectResult;
        ok!.Value.Should().Be(1);

        roleServicesMock.VerifyAll();
    }

    [Fact]
    public async Task Create_ShouldReturnBadRequest_WhenServiceFails()
    {
        // Arrange
        var roleServicesMock = new Mock<IRoleServices>(MockBehavior.Strict);
        roleServicesMock
            .Setup(s => s.AddAsync(It.IsAny<Role>()))
            .ReturnsAsync(0);

        var controller = CreateController(roleServicesMock);
        var request = new RoleRequest { RoleName = "Any" };

        // Act
        var actionResult = await controller.Create(request);

        // Assert
        actionResult.Result.Should().BeOfType<BadRequestObjectResult>();
        var bad = actionResult.Result as BadRequestObjectResult;
        bad!.Value.Should().Be("Failed to create role.");

        roleServicesMock.VerifyAll();
    }
}