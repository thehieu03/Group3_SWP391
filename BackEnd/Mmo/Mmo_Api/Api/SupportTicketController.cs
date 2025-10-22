using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Mmo_Application.Services;
using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;
using Mmo_Domain.Models;

namespace Mmo_Api.Api
{
    [Route("api/supporttickets")]
    [ApiController]
    public class SupportTicketsController : ControllerBase
    {
        private readonly ISupportTicketServices _supportTicketServices;
        private readonly IAccountServices _accountServices;
        private readonly IMapper _mapper;

        public SupportTicketsController(
            ISupportTicketServices supportTicketServices,
            IAccountServices accountServices,
            IMapper mapper)
        {
            _supportTicketServices = supportTicketServices;
            _accountServices = accountServices;
            _mapper = mapper;
        }

        public ISupportTicketServices Get_supportTicketServices()
        {
            return _supportTicketServices;
        }

        [HttpGet]
        [EnableQuery]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(IEnumerable<SupportTicketResponse>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<SupportTicketResponse>>> GetAllTickets(ISupportTicketServices _supportTicketServices)
        {
            var tickets = await _supportTicketServices.GetAllAsync();
            if (tickets == null || !tickets.Any())
                return NotFound();

            var accounts = await _accountServices.GetAllAsync();
            foreach (var ticket in tickets)
            {
                ticket.Account = accounts.FirstOrDefault(a => a.Id == ticket.AccountId);
            }

            var response = _mapper.Map<IEnumerable<SupportTicketResponse>>(tickets);
            return Ok(response);
        }

        [HttpGet("getTicketById")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(SupportTicketResponse), StatusCodes.Status200OK)]
        public async Task<ActionResult<SupportTicketResponse>> GetTicketById([FromQuery] int id)
        {
            var ticket = await _supportTicketServices.GetByIdAsync(id);
            if (ticket == null)
                return NotFound();

            var accounts = await _accountServices.GetAllAsync() ?? new List<Account>();
            ticket.Account = accounts.FirstOrDefault(a => a.Id == ticket.AccountId);

            var response = _mapper.Map<SupportTicketResponse>(ticket);
            return Ok(response);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateTicket([FromBody] SupportTicketRequest request)
        {
            if (request == null || !ModelState.IsValid)
                return BadRequest();

            var newTicket = _mapper.Map<SupportTicket>(request);
            newTicket.CreatedAt = DateTime.Now;
            

            var result = await _supportTicketServices.AddAsync(newTicket);
            return result > 0 ? Ok() : BadRequest();
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteTicket(int id)
        {
            var existing = await _supportTicketServices.GetByIdAsync(id);
            if (existing == null)
                return NotFound();

            var result = await _supportTicketServices.DeleteAsync(id);
            return result > 0 ? Ok() : BadRequest();
        }
    }
}
