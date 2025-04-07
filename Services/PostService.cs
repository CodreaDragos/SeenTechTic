using WebAPIDemo.Models;
using WebAPIDemo.Repositories;

namespace WebAPIDemo.Services
{
    public class PostService : IPostService
    {
        private readonly IPostRepository _postRepository;

        public PostService(IPostRepository postRepository)
        {
            _postRepository = postRepository;
        }

        public Post? CreatePost(Post post)
        {
            return _postRepository.create(post);
        }

        public List<Post> GetAllPosts()
        {
            return _postRepository.getAll();
        }

        public Post? GetPostById(int postId)
        {
            return _postRepository.getOne(postId);
        }

        public Post? UpdatePost(Post post)
        {
            return _postRepository.update(post);
        }

        public bool DeletePost(int postId)
        {
            return _postRepository.delete(postId) > 0;
        }
    }
}
