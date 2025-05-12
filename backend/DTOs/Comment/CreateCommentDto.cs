namespace WebAPIDemo.DTOs.Comment
{
    public class CreateCommentDto
    {
        public string CommentContent { get; set; } = string.Empty;
        public int PostId { get; set; }
        public int AuthorId { get; set; }
    }
}
