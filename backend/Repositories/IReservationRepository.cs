using WebAPIDemo.Models;

namespace WebAPIDemo.Repositories
{
    public interface IReservationRepository
    {
        Reservation? create(Reservation reservation);
        List<Reservation> getAll();
        Reservation? getOne(int reservationId);
        Reservation? update(Reservation reservation);
        int delete(int reservationId);
        bool isFieldAvailable(int fieldId, DateTime startTime, DateTime endTime);
    }
} 