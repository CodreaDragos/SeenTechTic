    using System.ComponentModel.DataAnnotations.Schema;

    namespace WebAPIDemo.Models
    {
        public class Reservation
        {
            [Column("reservation_id")]
            public int ReservationId { get; set; }

            [Column("start_time")]
            public DateTime StartTime { get; set; }
            [Column("end_time")]
            public DateTime EndTime { get; set; }

            [Column("author")]
            public User Author { get; set; }

            [Column("field")]
            public Field Field { get; set; }

            public List<User> Participants { get; set; }
        }
    }
