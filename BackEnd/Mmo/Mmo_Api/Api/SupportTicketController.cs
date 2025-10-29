using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Mmo_Api.Api;

[Route("api/supporttickets")]
[ApiController]
public class SupportTicketController : ControllerBase
{
    private readonly ISupportticketServices _services;
    private readonly IMapper _mapper;

    public SupportTicketController(ISupportticketServices supporttickets, IMapper mapper)
    {
        _services = supporttickets;
        _mapper = mapper;
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateSupportTicket([FromBody] SupportTicketRequest supportTicketRequest)
    {
        if (!ModelState.IsValid) return BadRequest();
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("id")?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
            return Unauthorized(new { message = "Không xác thực được người dùng" });
        var supportAdd = _mapper.Map<Supportticket>(supportTicketRequest);
        supportAdd.AccountId = userId;
        var result = await _services.AddAsync(supportAdd);
        return result > 0 ? Ok("Add support ticket") : StatusCode(StatusCodes.Status500InternalServerError);
    }
}

[Route("api/admin/supporttickets")]
[ApiController]
[Authorize(Policy = "AdminOnly")]
public class AdminSupportTicketController : ControllerBase
{
    private readonly ISupportticketServices _service;
    private readonly IMapper _mapper;

    public AdminSupportTicketController(ISupportticketServices service, IMapper mapper)
    {
        _service = service;
        _mapper = mapper;
    }

    [HttpGet]
    [EnableQuery(PageSize = 50)]
    public ActionResult<IQueryable<SupportTicketResponse>> GetAll()
    {
        var q = _service.GetQueryableWithAccount()
            .Select(t => new SupportTicketResponse
            {
                Id = t.Id,
                AccountId = t.AccountId,
                Email = t.Email!,
                Phone = t.Phone,
                Title = t.Title!,
                Content = t.Content!,
                CreatedAt = t.CreatedAt,
                Status = t.Status ?? "OPEN",
                Account = t.Account == null ? null : new AccountMiniResponse
                {
                    Id = t.Account.Id,
                    Username = t.Account.Username,
                    Email = t.Account.Email
                }
            });
        return Ok(q);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SupportTicketResponse>> GetById(int id)
    {
        var ticket = await _service.GetByIdWithAccountAsync(id);
        if (ticket == null) return NotFound();
        return Ok(_mapper.Map<SupportTicketResponse>(ticket));
    }

    public class ReplyRequest { public string Message { get; set; } = null!; }
    [HttpPost("{id}/reply")]
    public async Task<ActionResult> Reply(int id, [FromBody] ReplyRequest body)
    {
        if (string.IsNullOrWhiteSpace(body?.Message)) return BadRequest(new { message = "Message is required" });
        var adminIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(adminIdStr) || !int.TryParse(adminIdStr, out var adminId)) return Unauthorized();
        var ok = await _service.ReplyAsync(id, body.Message, adminId);
        if (!ok) return StatusCode(500, new { message = "Failed to reply" });
        return Ok(new { message = "Replied" });
    }

    public class UpdateStatusRequest { public string Status { get; set; } = null!; }
    [HttpPut("{id}/status")]
    public async Task<ActionResult<SupportTicketResponse>> UpdateStatus(int id, [FromBody] UpdateStatusRequest body)
    {
        var allowed = new[] { "OPEN", "PENDING", "RESOLVED", "CLOSED" };
        if (string.IsNullOrWhiteSpace(body?.Status) || !allowed.Contains(body.Status))
            return BadRequest(new { message = "Status must be OPEN|PENDING|RESOLVED|CLOSED" });
        var ok = await _service.UpdateStatusAsync(id, body.Status);
        if (!ok) return NotFound();
        var updated = await _service.GetByIdWithAccountAsync(id);
        return Ok(_mapper.Map<SupportTicketResponse>(updated));
    }

    [HttpGet("stats")]
    public async Task<ActionResult> GetStats()
    {
        var (total, open, pending, resolved, closed) = await _service.GetStatsAsync();
        return Ok(new { totalTickets = total, open, pending, resolved, closed });
    }
}