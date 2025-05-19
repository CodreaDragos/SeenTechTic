using Microsoft.AspNetCore.Mvc;
using WebAPIDemo.Models;
using WebAPIDemo.Services;
using WebAPIDemo.DTOs.Reservation;
using Microsoft.Extensions.Logging;

namespace WebAPIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationController : ControllerBase
    {
        private readonly IReservationService _reservationService;
        private readonly ILogger<ReservationController> _logger;

        public ReservationController(IReservationService reservationService, ILogger<ReservationController> logger)
        {
            _reservationService = reservationService;
            _logger = logger;
        }

        [HttpGet]
public IActionResult GetAllReservations()
{
    try
    {
        var reservations = _reservationService.getAll()
            .Select(r => new ReservationResponseDto
            {
                ReservationId = r.ReservationId,
                StartTime = r.StartTime,
                EndTime = r.EndTime,
                AuthorId = r.AuthorId,
                FieldId = r.FieldId
            })
            .ToList();
        return Ok(reservations);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error in GetAllReservations");
        return BadRequest(ex.Message);
    }
}


        private int GetCurrentUserId()
        {
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)
                              ?? HttpContext.User.Claims.FirstOrDefault(c => c.Type == "sub")
                              ?? HttpContext.User.Claims.FirstOrDefault(c => c.Type == "userId");

            if (userIdClaim == null)
            {
                _logger.LogWarning("UserId claim not found in token");
                return 0;
            }

            if (!int.TryParse(userIdClaim.Value, out int userId))
            {
                _logger.LogWarning($"UserId claim value '{userIdClaim.Value}' is not a valid integer");
                return 0;
            }

            _logger.LogInformation($"Extracted userId: {userId}");
            return userId;
        }
        [HttpPost]
        public IActionResult CreateReservation([FromBody] CreateReservationDto dto)
        {
            try
            {
                var reservation = new Reservation
                {
                    StartTime = dto.StartTime,
                    EndTime = dto.EndTime,
                    AuthorId = dto.AuthorId,
                    FieldId = dto.FieldId,
                    // Populează Participants dacă e nevoie
                };

                var created = _reservationService.create(reservation);
                return CreatedAtAction(nameof(GetReservation), new { id = created.ReservationId }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating reservation");
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("{id}")]
        public IActionResult GetReservation(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var reservation = _reservationService.getOne(id);

                if (reservation == null)
                    return NotFound();

                if (reservation.AuthorId != userId)
                    return Forbid();  // 403 Forbidden

                var reservationDto = new ReservationResponseDto
                {
                    ReservationId = reservation.ReservationId,
                    StartTime = reservation.StartTime,
                    EndTime = reservation.EndTime,
                    AuthorId = reservation.AuthorId,
                    FieldId = reservation.FieldId
                };

                return Ok(reservationDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetReservation");
                return BadRequest(ex.Message);
            }
        }
        [HttpPut("{id}")]
        public IActionResult UpdateReservation(int id, [FromBody] UpdateReservationDto reservationDto)
        {
            try
            {
                if (id != reservationDto.ReservationId)
                {
                    return BadRequest("Reservation ID mismatch");
                }

                var updatedReservation = _reservationService.update(reservationDto);
                return Ok(updatedReservation);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteReservation(int id)
        {
            try
            {
                _reservationService.delete(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }


}

