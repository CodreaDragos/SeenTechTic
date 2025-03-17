using System.ComponentModel.DataAnnotations.Schema;

namespace WebAPIDemo.Models
{
    [Table("posts")]
    public class Post
    {
        public Post()
        {
            Comments = new List<Comment>();
        }

        [Column("post_id")]
        public int PostId { get; set; }

        [Column("post_title")]
        public string PostTitle { get; set; } = string.Empty;

        [Column("post_description")]
        public string PostDescription { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("author_id")]
        public int AuthorId { get; set; }

        [ForeignKey("AuthorId")]
        public User Author { get; set; }

        public List<Comment> Comments { get; set; }

        // One-to-one relationship with Reservation
        public int? ReservationId { get; set; }
        
        [ForeignKey("ReservationId")]
        public Reservation? Reservation { get; set; }
    }
}
