using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Mmo_Application.Services.Interface;

namespace Mmo_Api.Api;

[Route("api/feedbacks")]
[ApiController]
public class FeedbackController : ControllerBase
{
    private readonly IFeedbackServices _feedbackServices;
    private readonly IMapper _mapper;

    public FeedbackController(IFeedbackServices feedbackServices, IMapper mapper)
    {
        _feedbackServices = feedbackServices;
        _mapper = mapper;
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateFeedback([FromBody] FeedbackRequest feedbackRequest)
    {
        if (!ModelState.IsValid) return BadRequest("Form not good");
        var dataAdd = _mapper.Map<Feedback>(feedbackRequest);
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized("Token not found");
        dataAdd.AccountId = userId;
        var result = await _feedbackServices.AddAsync(dataAdd);
        return result > 0 ? Ok("Add success") : StatusCode(StatusCodes.Status500InternalServerError);
    }
}
