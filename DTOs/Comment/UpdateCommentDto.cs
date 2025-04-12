namespace WebAPIDemo.DTOs.Comment
{
    public class UpdateCommentDto
    {
        public int CommentId { get; set; }
        public string CommentContent { get; set; } = string.Empty;
        public int PostId { get; set; }
        public int AuthorId { get; set; }
    }
}
