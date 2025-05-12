using WebAPIDemo.Models;
using WebAPIDemo.Data;
using Microsoft.EntityFrameworkCore;

namespace WebAPIDemo.Repositories
{
    public class CommentRepository : ICommentRepository
    {
        private readonly DataContext _context;

        public CommentRepository(DataContext context)
        {
            _context = context;
        }

        public Comment? create(Comment comment)
        {
            comment.CreatedAt = DateTime.Now;
            _context.Comments.Add(comment);
            _context.SaveChanges();
            return comment;
        }

        public List<Comment> getAll()
        {
            return _context.Comments
                .Include(c => c.Author)
                .Include(c => c.Post)
                .AsNoTracking()
                .ToList();
        }

        public Comment? getOne(int commentId)
        {
            return _context.Comments
                .Include(c => c.Author)
                .Include(c => c.Post)
                .AsNoTracking()
                .FirstOrDefault(c => c.CommentId == commentId);
        }

        public Comment? update(Comment comment)
        {
            var existingComment = _context.Comments
                .FirstOrDefault(c => c.CommentId == comment.CommentId);
                
            if (existingComment == null)
            {
                return null;
            }

            existingComment.CommentContent = comment.CommentContent;
            existingComment.PostId = comment.PostId;
            existingComment.AuthorId = comment.AuthorId;

            _context.SaveChanges();
            return existingComment;
        }

        public int delete(int commentId)
        {
            var comment = _context.Comments.Find(commentId);
            if (comment != null)
            {
                _context.Comments.Remove(comment);
                return _context.SaveChanges();
            }
            return 0;
        }
    }
}
