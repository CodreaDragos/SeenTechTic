using WebAPIDemo.Models;
using WebAPIDemo.Data;
using Microsoft.EntityFrameworkCore;

namespace WebAPIDemo.Repositories
{
    public class ReservationRepository : IReservationRepository
    {
        private readonly DataContext _context;

        public ReservationRepository(DataContext context)
        {
            _context = context;
        }

        public Reservation? create(Reservation reservation)
        {
            _context.Reservations.Add(reservation);
            _context.SaveChanges();
            return reservation;
        }

        public IQueryable<Reservation> getAll()
        {
            return _context.Reservations.Include(r => r.Participants);
        }

        // New method to get reservations by field and date
        public IQueryable<Reservation> getByFieldAndDate(int fieldId, DateTime date)
        {
            var dateOnly = date.Date;
            var nextDate = dateOnly.AddDays(1);

            return _context.Reservations
                .Where(r => r.FieldId == fieldId &&
                            r.StartTime >= dateOnly &&
                            r.StartTime < nextDate)
                .Include(r => r.Participants);
        }

        public Reservation? getOne(int reservationId)
        {
            return _context.Reservations
                .Include(r => r.Field)
                .Include(r => r.Author)
                .Include(r => r.Participants)
                .FirstOrDefault(r => r.ReservationId == reservationId);
        }

        public Reservation? update(Reservation reservation)
        {
            _context.Reservations.Update(reservation);
            _context.SaveChanges();
            return reservation;
        }

        public int delete(int reservationId)
        {
            var reservation = _context.Reservations.Find(reservationId);
            if (reservation != null)
            {
                _context.Reservations.Remove(reservation);
                return _context.SaveChanges();
            }
            return 0;
        }

        public bool isFieldAvailable(int fieldId, DateTime startTime, DateTime endTime)
        {
            return !_context.Reservations.Any(r =>
                r.FieldId == fieldId &&
                ((startTime >= r.StartTime && startTime < r.EndTime) ||
                 (endTime > r.StartTime && endTime <= r.EndTime) ||
                 (startTime <= r.StartTime && endTime >= r.EndTime)));
        }
    }
} 