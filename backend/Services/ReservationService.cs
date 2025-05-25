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
            // Încarcă rezervarea existentă cu participanți
            var reservation = _reservationRepository
                .getAll()
                .Include(r => r.Participants)
                .FirstOrDefault(r => r.ReservationId == dto.ReservationId);

            if (reservation == null)
            {
                _loggerService.LogError($"No reservation found with id {dto.ReservationId}");
                throw new Exception($"No reservation found with id {dto.ReservationId}");
            }

            // Validare timp
            if (dto.StartTime >= dto.EndTime)
            {
                _loggerService.LogError("Start time must be before end time");
                throw new Exception("Start time must be before end time");
            }

            // Verificare disponibilitate teren
            if (!isFieldAvailable(dto.FieldId, dto.StartTime, dto.EndTime))
            {
                _loggerService.LogError("Field is not available in selected time range.");
                throw new Exception("Field is not available in selected time range.");
            }

            // Actualizează câmpuri de bază
            reservation.StartTime = dto.StartTime;
            reservation.EndTime = dto.EndTime;
            reservation.FieldId = dto.FieldId;
            reservation.AuthorId = dto.AuthorId;

            // Actualizează lista de participanți
            reservation.Participants.Clear();
            var participants = dto.ParticipantIds
                .Select(id => _userRepository.getOne(id))
                .Where(user => user != null)
                .ToList();
            foreach (var user in participants)
            {
                reservation.Participants.Add(user);
            }

            var updatedReservation = _reservationRepository.update(reservation);
            if (updatedReservation == null)
            {
                _loggerService.LogError("Failed to update reservation");
                throw new Exception("Failed to update reservation");
            }

            _loggerService.LogInfo($"Reservation {dto.ReservationId} updated successfully");
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