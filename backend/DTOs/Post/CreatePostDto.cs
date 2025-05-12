namespace WebAPIDemo.DTOs.Post
{
    public class CreatePostDto
    {
        public string PostTitle { get; set; } = string.Empty;
        public string PostDescription { get; set; } = string.Empty;
        public int AuthorId { get; set; }
        public int? ReservationId { get; set; }
    }
}
