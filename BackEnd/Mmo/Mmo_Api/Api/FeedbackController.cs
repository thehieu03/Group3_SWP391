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

    [HttpGet("product/{productId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(IEnumerable<FeedbackResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<FeedbackResponse>>> GetFeedbacksByProductId(int productId)
    {
        try
        {
            var feedbacks = await _feedbackServices.GetByProductIdAsync(productId);

            if (feedbacks == null || !feedbacks.Any())
                return NotFound(new { message = $"No feedbacks found for product ID {productId}" });

            var resultResponse = _mapper.Map<IEnumerable<FeedbackResponse>>(feedbacks);
            return Ok(resultResponse);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}