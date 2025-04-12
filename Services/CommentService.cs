using WebAPIDemo.Models;
using WebAPIDemo.Repositories;


namespace WebAPIDemo.Services
{
    public class CommentService: ICommentService
    {
        private readonly ICommentRepository _commentRepository;
        public CommentService(ICommentRepository commentRepository)
        {
            _commentRepository = commentRepository;
        }
        public Comment? CreateComment(Comment comment)
        {
            return _commentRepository.create(comment);
        }
        public List<Comment> GetAllComments()
        {
            return _commentRepository.getAll();
        }
        public Comment? GetCommentById(int commentId)
        {
            return _commentRepository.getOne(commentId);
        }
        public Comment? UpdateComment(Comment comment)
        {
            return _commentRepository.update(comment);
        }
        public bool DeleteComment(int commentId)
        {
            return _commentRepository.delete(commentId) > 0;
        }
    }
}
