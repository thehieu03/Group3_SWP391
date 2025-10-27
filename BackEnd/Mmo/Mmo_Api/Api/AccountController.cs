using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelRequest;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Mmo_Api.ApiController;

[Route("api/accounts")]
[ApiController]
public class AccountController : ControllerBase
{
    private readonly IAccountServices _accountServices;
    private readonly IMapper _mapper;

    public AccountController(IAccountServices accountServices,IMapper mapper)
    {
        _accountServices = accountServices;
        _mapper = mapper;
    }
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<Account>>> GetAllAccounts()
    {
        try
        {
            var accounts = await _accountServices.GetAllAsync();
            return Ok(accounts);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi khi lấy danh sách accounts: {ex.Message}");
        }
    }

    /// <summary>
    /// Cập nhật thông tin profile của user hiện tại
    /// </summary>
    /// <param name="request">Thông tin cần cập nhật</param>
    /// <returns>Kết quả cập nhật</returns>
    [HttpPut("profile")]
    [Authorize] // Yêu cầu authentication
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> UpdateProfile([FromBody] ProfileUpdateRequest request)
    {
        try
        {
            // Kiểm tra model validation
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Kiểm tra request body
            if (request == null)
            {
                return BadRequest("Request body cannot be null");
            }

            // Kiểm tra ít nhất một field được cập nhật
            if (string.IsNullOrEmpty(request.Username) && 
                string.IsNullOrEmpty(request.Email) && 
                string.IsNullOrEmpty(request.Phone))
            {
                return BadRequest("At least one field must be provided for update");
            }

            // Lấy user ID từ JWT token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid token");
            }

            // Cập nhật profile
            var result = await _accountServices.UpdateProfileAsync(userId, request);

            if (!result)
            {
                // Kiểm tra xem user có tồn tại không
                var account = await _accountServices.GetByIdAsync(userId);
                if (account == null)
                {
                    return NotFound("User not found");
                }

                // Nếu user tồn tại nhưng update thất bại, có thể do username/email đã tồn tại
                return BadRequest("Update failed. Username or email may already exist");
            }

            return Ok(new { message = "Profile updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}