using WebAPIDemo.Models;

namespace WebAPIDemo.Services
{
    public interface IPostService
    {
        Post? CreatePost(Post post);
        List<Post> GetAllPosts();
        Post? GetPostById(int postId);
        Post? UpdatePost(Post post);
        bool DeletePost(int postId);
    }
}
