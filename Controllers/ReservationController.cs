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
                var reservations = _reservationService.getAll();
                return Ok(reservations);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetReservation(int id)
        {
            try
            {
                var reservation = _reservationService.getOne(id);
                return Ok(reservation);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
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

                var reservation = new Reservation
                {
                    ReservationId = reservationDto.ReservationId,
                    StartTime = reservationDto.StartTime,
                    EndTime = reservationDto.EndTime,
                    FieldId = reservationDto.FieldId,
                    AuthorId = reservationDto.AuthorId,
                    Participants = new List<User>() // Will be populated by the service
                };

                var updatedReservation = _reservationService.update(reservation);
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