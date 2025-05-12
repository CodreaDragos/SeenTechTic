using WebAPIDemo.Models;

namespace WebAPIDemo.Repositories
{
    public interface ICommentRepository
    {
        Comment? create(Comment comment);
        List<Comment> getAll();
        Comment? getOne(int commentId);
        Comment? update( Comment comment);
        int delete(int commentId);
    }
}
