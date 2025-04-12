using WebAPIDemo.Models;

namespace WebAPIDemo.Services
{
    public interface ICommentService
    {
        Comment? CreateComment(Comment comment);
        List<Comment> GetAllComments();
        Comment? GetCommentById(int CommentId);
        Comment? UpdateComment(Comment comment);
        bool DeleteComment(int CommentId);

    }
}
