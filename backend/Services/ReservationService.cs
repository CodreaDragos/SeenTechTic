using WebAPIDemo.Models;
using WebAPIDemo.Repositories;
using WebAPIDemo.Services;
using Microsoft.EntityFrameworkCore;
using WebAPIDemo.DTOs.Reservation;

namespace WebAPIDemo.Services
{
    public class ReservationService : IReservationService
    {
        private readonly IReservationRepository _reservationRepository;
        private readonly IFieldRepository _fieldRepository;
        private readonly IUserRepository _userRepository;
        private readonly ILoggerService _loggerService;

        public ReservationService(
            IReservationRepository reservationRepository,
            IFieldRepository fieldRepository,
            IUserRepository userRepository,
            ILoggerService loggerService)
        {
            _reservationRepository = reservationRepository;
            _fieldRepository = fieldRepository;
            _userRepository = userRepository;
            _loggerService = loggerService;
        }

        public Reservation create(Reservation reservation)
        {
            // Load the field
            var field = _fieldRepository.getOne(reservation.FieldId);
            if (field == null)
            {
                _loggerService.LogError($"Field with id {reservation.FieldId} not found");
                throw new Exception($"Field with id {reservation.FieldId} not found");
            }
            reservation.Field = field;

            // Load the author
            var author = _userRepository.getOne(reservation.AuthorId);
            if (author == null)
            {
                _loggerService.LogError($"User with id {reservation.AuthorId} not found");
                throw new Exception($"User with id {reservation.AuthorId} not found");
            }
            reservation.Author = author;

            // Ensure Participants is not null
            if (reservation.Participants == null)
            {
                reservation.Participants = new List<User>();
            }

            // Check if field is available
            if (!isFieldAvailable(reservation.FieldId, reservation.StartTime, reservation.EndTime))
            {
                _loggerService.LogError($"Field {field.FieldName} is not available for the specified time period");
                throw new Exception($"Field {field.FieldName} is not available for the specified time period");
            }

            // Validate time range
            if (reservation.StartTime >= reservation.EndTime)
            {
                _loggerService.LogError("Start time must be before end time");
                throw new Exception("Start time must be before end time");
            }

            // Validate max participants
            if (reservation.MaxParticipants <= 0)
            {
                _loggerService.LogError("Max participants must be greater than 0");
                throw new Exception("Max participants must be greater than 0");
            }

            var createdReservation = _reservationRepository.create(reservation);
            if (createdReservation == null)
            {
                _loggerService.LogError("Failed to create reservation");
                throw new Exception("Failed to create reservation");
            }

            _loggerService.LogInfo($"Reservation created successfully for field {field.FieldName}");
            return createdReservation;
        }

        public List<Reservation> getAll()
        {
            return _reservationRepository.getAll().ToList();
        }

        // New method to get reservations by field and date
        public List<Reservation> getByFieldAndDate(int fieldId, DateTime date)
        {
            return _reservationRepository.getByFieldAndDate(fieldId, date).ToList();
        }

        public Reservation getOne(int reservationId)
        {
            var reservation = _reservationRepository.getOne(reservationId);
            if (reservation == null)
            {
                _loggerService.LogError($"No reservation found with id {reservationId}");
                throw new Exception($"No reservation found with id {reservationId}");
            }
            return reservation;
        }

        public Reservation update(UpdateReservationDto dto)
        {
            var reservation = _reservationRepository
                .getAll()
                .Include(r => r.Participants)
                .FirstOrDefault(r => r.ReservationId == dto.ReservationId);

            if (reservation == null)
                throw new Exception($"No reservation found with id {dto.ReservationId}");

            // Only update fields if they are provided
            if (dto.StartTime.HasValue) reservation.StartTime = dto.StartTime.Value;
            if (dto.EndTime.HasValue) reservation.EndTime = dto.EndTime.Value;
            if (dto.FieldId.HasValue) reservation.FieldId = dto.FieldId.Value;
            if (dto.AuthorId.HasValue) reservation.AuthorId = dto.AuthorId.Value;
            if (dto.MaxParticipants.HasValue)
            {
                if (dto.MaxParticipants.Value <= 0)
                {
                    throw new Exception("Max participants must be greater than 0");
                }
                reservation.MaxParticipants = dto.MaxParticipants.Value;
            }

            // Only update participants if provided
            if (dto.ParticipantIds != null)
            {
                if (dto.ParticipantIds.Count > reservation.MaxParticipants)
                {
                    throw new Exception($"Cannot add more than {reservation.MaxParticipants} participants");
                }

                reservation.Participants.Clear();
                var participants = dto.ParticipantIds
                    .Select(id => _userRepository.getOne(id))
                    .Where(user => user != null)
                    .ToList();
                foreach (var user in participants)
                {
                    reservation.Participants.Add(user);
                }
                // Ensure the author is always a participant
                if (!reservation.Participants.Any(u => u.UserId == reservation.AuthorId))
                {
                    var authorUser = _userRepository.getOne(reservation.AuthorId);
                    if (authorUser != null)
                        reservation.Participants.Add(authorUser);
                }
            }

            var updatedReservation = _reservationRepository.update(reservation);
            if (updatedReservation == null)
                throw new Exception("Failed to update reservation");

            return updatedReservation;
        }

        public int delete(int reservationId)
        {
            var reservation = _reservationRepository.getOne(reservationId);
            if (reservation == null)
            {
                _loggerService.LogError($"No reservation found with id {reservationId}");
                throw new Exception($"No reservation found with id {reservationId}");
            }

            var result = _reservationRepository.delete(reservationId);
            if (result == 0)
            {
                _loggerService.LogError("Failed to delete reservation");
                throw new Exception("Failed to delete reservation");
            }

            _loggerService.LogInfo($"Reservation {reservationId} deleted successfully");
            return result;
        }

        public bool isFieldAvailable(int fieldId, DateTime startTime, DateTime endTime)
        {
            return _reservationRepository.isFieldAvailable(fieldId, startTime, endTime);
        }
    }
} 