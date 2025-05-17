using Microsoft.AspNetCore.Mvc;
using WebAPIDemo.Models;
using WebAPIDemo.Services;
using WebAPIDemo.DTOs.Reservation;

namespace WebAPIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationController : ControllerBase
    {
        private readonly IReservationService _reservationService;

        public ReservationController(IReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        [HttpPost]
        public IActionResult CreateReservation([FromBody] CreateReservationDto reservationDto)
        {
            try
            {
                var reservation = new Reservation
                {
                    StartTime = reservationDto.StartTime,
                    EndTime = reservationDto.EndTime,
                    FieldId = reservationDto.FieldId,
                    AuthorId = reservationDto.AuthorId,
                    Participants = new List<User>() // Will be populated by the service
                };

                var createdReservation = _reservationService.create(reservation);
                return CreatedAtAction(nameof(GetReservation), new { id = createdReservation.ReservationId }, createdReservation);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        public IActionResult GetAllReservations()
        {
            try
            {
                var userId = GetCurrentUserId();
                var reservations = _reservationService.getAll()
                    .Where(r => r.AuthorId == userId)
                    .ToList();
                return Ok(reservations);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Metodă ajutătoare pentru a extrage userId din contextul HTTP (depinde de implementarea ta de autentificare)
        private int GetCurrentUserId()
        {
            // Exemplu, dacă userId e stocat în claim-ul "sub"
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "sub");
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
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

                return Ok(reservation);
            }
            catch (Exception ex)
            {
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