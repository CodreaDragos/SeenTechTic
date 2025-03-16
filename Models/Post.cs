using System.ComponentModel.DataAnnotations.Schema;

namespace WebAPIDemo.Models
{
    [Table("posts")]
    public class Post
    {
        [Column("post_id")]
        public int PostId { get; set; }

        [Column("post_title")]
        public string PostTitle { get; set; } = string.Empty;

        [Column("post_description")]
        public string PostDescription { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("author")]
        public User Author { get; set; }
        public List<Comment> Comments { get; set; }
        public Reservation Reservation { get; set; }
    }


}
