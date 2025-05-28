using WebAPIDemo.DTOs.Reservation;
using WebAPIDemo.Models;

namespace WebAPIDemo.Services
{
    public interface IReservationService
    {
        Reservation create(Reservation reservation);
        List<Reservation> getAll();
        Reservation getOne(int reservationId);
        Reservation update(UpdateReservationDto dto);

        int delete(int reservationId);
        bool isFieldAvailable(int fieldId, DateTime startTime, DateTime endTime);

        // New method to get reservations by field and date
        List<Reservation> getByFieldAndDate(int fieldId, DateTime date);
        List<User> FindUsersByUsernames(List<string> usernames);

    }
} 