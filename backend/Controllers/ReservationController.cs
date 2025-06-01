using Microsoft.AspNetCore.Mvc;
using WebAPIDemo.Models;
using WebAPIDemo.Services;
using WebAPIDemo.DTOs.Reservation;
using Microsoft.Extensions.Logging;
using WebAPIDemo.Repositories;

namespace WebAPIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationController : ControllerBase
    {
        private readonly IReservationService _reservationService;
        private readonly ILogger<ReservationController> _logger;
        private readonly IUserRepository _userRepository;

        public ReservationController(IReservationService reservationService, ILogger<ReservationController> logger, IUserRepository userRepository)
        {
            _reservationService = reservationService;
            _logger = logger;
            _userRepository = userRepository;
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
                        FieldId = r.FieldId,
                        MaxParticipants = r.MaxParticipants,
                        ParticipantIds = r.Participants?.Select(u => u.UserId).ToList() ?? new List<int>(),
                        FieldName = r.Field?.FieldName
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

        // New endpoint to get reserved hours for a field and date
        [HttpGet("occupied-hours")]
        public IActionResult GetOccupiedHours([FromQuery] int fieldId, [FromQuery] string date)
        {
            try
            {
                if (!DateTime.TryParseExact(date, "yyyy-MM-dd", null, System.Globalization.DateTimeStyles.None, out DateTime parsedDate))
                {
                    return BadRequest("Invalid date format. Expected yyyy-MM-dd.");
                }

                var reservations = _reservationService.getByFieldAndDate(fieldId, parsedDate);

                var occupiedHours = reservations.Select(r =>
                {
                    var startHour = r.StartTime.Hour;
                    var ampm = startHour >= 12 ? "PM" : "AM";
                    var hour12 = startHour % 12;
                    if (hour12 == 0) hour12 = 12;
                    return $"{hour12} {ampm}";
                }).ToList();

                return Ok(occupiedHours);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetOccupiedHours");
                return BadRequest(ex.Message);
            }
        }


        private int GetCurrentUserId()
{
    // Log all claims for debugging
    foreach (var claim in HttpContext.User.Claims)
    {
        _logger.LogInformation($"CLAIM TYPE: {claim.Type} | VALUE: {claim.Value}");
    }

    // 1. Prefer the "id" claim if present and valid
    var idClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id");
    if (idClaim != null && int.TryParse(idClaim.Value, out int idFromClaim))
    {
        _logger.LogInformation($"Extracted userId from 'id' claim: {idFromClaim}");
        return idFromClaim;
    }

    // 2. Otherwise, try to find the first claim whose value is an integer (skip emails)
    foreach (var claim in HttpContext.User.Claims)
    {
        if (int.TryParse(claim.Value, out int intValue))
        {
            _logger.LogInformation($"Extracted userId from claim '{claim.Type}': {intValue}");
            return intValue;
        }
    }

    _logger.LogWarning("UserId claim not found in token");
    return 0;
}
        [HttpPost]
        public IActionResult CreateReservation([FromBody] CreateReservationDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var participants = dto.ParticipantIds
                    .Select(id => _userRepository.getOne(id))
                    .Where(user => user != null)
                    .ToList();

                // Ensure the author is a participant
                if (!participants.Any(u => u.UserId == userId))
                {
                    var authorUser = _userRepository.getOne(userId);
                    if (authorUser != null)
                        participants.Add(authorUser);
                }

                var reservation = new Reservation
                {
                    StartTime = dto.StartTime,
                    EndTime = dto.EndTime,
                    AuthorId = userId,
                    FieldId = dto.FieldId,
                    MaxParticipants = dto.MaxParticipants,
                    Participants = participants
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
                    FieldId = reservation.FieldId,
                    MaxParticipants = reservation.MaxParticipants,
                    ParticipantIds = reservation.Participants?.Select(u => u.UserId).ToList() ?? new List<int>(),
                    FieldName = reservation.Field?.FieldName
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

        [HttpPost("{id}/join")]
        public IActionResult JoinReservation(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var reservation = _reservationService.getOne(id);

                if (reservation == null)
                    return NotFound();

                if (reservation.Participants.Any(u => u.UserId == userId))
                    return BadRequest("You are already a participant.");

                if (reservation.Participants.Count >= reservation.MaxParticipants)
                    return BadRequest("Reservation is full.");

                var user = _userRepository.getOne(userId);
                if (user == null)
                    return NotFound("User not found.");

                reservation.Participants.Add(user);
                _reservationService.update(new UpdateReservationDto
                {
                    ReservationId = reservation.ReservationId,
                    ParticipantIds = reservation.Participants.Select(u => u.UserId).ToList()
                });

                return Ok("Joined reservation successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error joining reservation");
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}/leave")]
        public IActionResult LeaveReservation(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0) // Assuming 0 is an invalid user ID
                {
                    return Unauthorized("User not authenticated.");
                }

                var reservation = _reservationService.getOne(id);

                if (reservation == null)
                    return NotFound("Reservation not found.");

                // Prevent author from leaving (they should delete)
                if (reservation.AuthorId == userId)
                {
                    return BadRequest("Author cannot leave their own reservation. Use delete instead.");
                }

                var participantToRemove = reservation.Participants.FirstOrDefault(u => u.UserId == userId);

                if (participantToRemove == null)
                {
                    return BadRequest("You are not a participant of this reservation.");
                }

                reservation.Participants.Remove(participantToRemove);

                // Update the reservation
                _reservationService.update(new UpdateReservationDto
                {
                    ReservationId = reservation.ReservationId,
                    StartTime = reservation.StartTime, // Keep existing values
                    EndTime = reservation.EndTime,     // Keep existing values
                    FieldId = reservation.FieldId,     // Keep existing values
                    MaxParticipants = reservation.MaxParticipants, // Keep existing values
                    ParticipantIds = reservation.Participants.Select(u => u.UserId).ToList()
                });

                return Ok("Left reservation successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving reservation");
                return BadRequest(ex.Message);
            }
        }
    }


}
