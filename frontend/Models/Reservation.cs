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

        [Column("author_id")]
        public int AuthorId { get; set; }

        [Column("field_id")]
        public int FieldId { get; set; }

        [ForeignKey("AuthorId")]
        public User Author { get; set; }

        [ForeignKey("FieldId")]
        public Field Field { get; set; }

        public List<User> Participants { get; set; }

        // One-to-one relationship with Post
        public Post Post { get; set; }
    }
}
