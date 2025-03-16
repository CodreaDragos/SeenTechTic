using System.ComponentModel.DataAnnotations.Schema;

namespace WebAPIDemo.Models
{
    public class Comment
    {
        [Column("comment_id")]
        public int CommentId { get; set; }

        [Column("comment_content")]
        public string CommentContent { get; set; } = string.Empty;
        [Column("createdAt")]
        public DateTime CreatedAt { get; set; }
        [Column("Post")]
        public Post Post { get; set; }
        [Column("User")]
        public User User { get; set; }
    }
}