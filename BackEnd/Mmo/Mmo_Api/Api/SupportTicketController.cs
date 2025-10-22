using AutoMapper;
using Microsoft.AspNetCore.Mvc;
<<<<<<< Updated upstream
using Microsoft.AspNetCore.OData.Query;
using Mmo_Application.Services;
=======
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
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
=======
        // ? GET: api/supporttickets?pageNumber=1&pageSize=10
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(IEnumerable<SupportTicketResponse>), StatusCodes.Status200OK)]
        public async Task<ActionResult<object>> GetAllTickets(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            // ? Gi?i h?n pageSize ch? ???c phép 5, 10, 20
            var allowedPageSizes = new[] { 5, 10, 20 };
            if (!allowedPageSizes.Contains(pageSize))
                pageSize = 10; // m?c ??nh 10 n?u nh?p sai

            if (pageNumber <= 0)
                pageNumber = 1;

>>>>>>> Stashed changes
            var tickets = await _supportTicketServices.GetAllAsync();
            if (tickets == null || !tickets.Any())
                return NotFound();

<<<<<<< Updated upstream
            var accounts = await _accountServices.GetAllAsync();
            foreach (var ticket in tickets)
=======
            var totalRecords = tickets.Count();
            var totalPages = (int)Math.Ceiling(totalRecords / (double)pageSize);

            // ? Phân trang
            var pagedTickets = tickets
                .OrderByDescending(t => t.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            // ? Gán thông tin tài kho?n
            var accounts = await _accountServices.GetAllAsync();
            foreach (var ticket in pagedTickets)
>>>>>>> Stashed changes
            {
                ticket.Account = accounts.FirstOrDefault(a => a.Id == ticket.AccountId);
            }

<<<<<<< Updated upstream
            var response = _mapper.Map<IEnumerable<SupportTicketResponse>>(tickets);
            return Ok(response);
=======
            var response = _mapper.Map<IEnumerable<SupportTicketResponse>>(pagedTickets);

            // ? Tr? v? d? li?u kèm meta
            return Ok(new
            {
                TotalRecords = totalRecords,
                TotalPages = totalPages,
                PageNumber = pageNumber,
                PageSize = pageSize,
                AllowedPageSizes = allowedPageSizes,
                Data = response
            });
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
            
=======
>>>>>>> Stashed changes

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
