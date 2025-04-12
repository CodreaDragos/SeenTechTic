using System.ComponentModel.DataAnnotations.Schema;

namespace WebAPIDemo.Models
{
    [Table("Comments")]
    public class Comment
    {
        [Column("comment_id")]
        public int CommentId { get; set; }

        [Column("comment_content")]
        public string CommentContent { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("post_id")]
        public int PostId { get; set; }

        [Column("author_id")]
        public int AuthorId { get; set; }

        [ForeignKey("PostId")]
        public Post Post { get; set; }

        [ForeignKey("AuthorId")]
        public User Author { get; set; }
    }
}