using WebAPIDemo.Models;
using WebAPIDemo.Data;
using Microsoft.EntityFrameworkCore;

namespace WebAPIDemo.Repositories
{
    public class PostRepository : IPostRepository
    {
        private readonly DataContext _context;

        public PostRepository(DataContext context)
        {
            _context = context;
        }

        public Post? create(Post post)
        {
            // Check if a post with the same ReservationId already exists
            var existingPost = _context.Posts.FirstOrDefault(p => p.ReservationId == post.ReservationId);
            if (existingPost != null)
            {
                throw new InvalidOperationException($"A post for ReservationId {post.ReservationId} already exists.");
            }

            _context.Posts.Add(post);
            _context.SaveChanges();
            return post;
        }

        public List<Post> getAll()
        {
            var posts = _context.Posts
                .Include(p => p.Author)
                .Include(p => p.Comments)
                    .ThenInclude(c => c.Author)
                .Include(p => p.Reservation)
                .ToList();

            foreach (var post in posts)
            {
                if (post.Author == null)
                {
                    Console.WriteLine($"Post {post.PostId} has null Author. AuthorId: {post.AuthorId}");
                }
            }

            return posts;
        }

        public Post? getOne(int postId)
        {
            return _context.Posts
                .Include(p => p.Author)
                .Include(p => p.Comments)
                .Include(p => p.Reservation)
                .FirstOrDefault(p => p.PostId == postId);
        }

        public Post? update(Post post)
        {
            _context.Posts.Update(post);
            _context.SaveChanges();
            return post;
        }

        public int delete(int postId)
        {
            var post = _context.Posts.Find(postId);
            if (post != null)
            {
                _context.Posts.Remove(post);
                return _context.SaveChanges();
            }
            return 0;
        }
    }
}
