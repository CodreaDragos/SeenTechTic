using WebAPIDemo.Models;

namespace WebAPIDemo.Repositories
{
    public interface IPostRepository
    {
        Post? create(Post post);
        List<Post> getAll();
        Post? getOne(int postId);
        Post? update(Post post);
        int delete(int postId);
    }
}
