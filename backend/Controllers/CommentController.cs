using Microsoft.AspNetCore.Mvc;
using WebAPIDemo.Models;
using WebAPIDemo.Services;
using WebAPIDemo.DTOs.Comment;

namespace WebAPIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentController : ControllerBase
    {
       private readonly ICommentService _commentService;
        public CommentController(ICommentService commentService)
        {
            _commentService = commentService;
        }
        [HttpGet]
        public ActionResult<List<Comment>> GetAllComments()
        {
            var comments = _commentService.GetAllComments();
            return Ok(comments);
        }
        [HttpGet("{commentId}")]
        public ActionResult<Comment> GetCommentById(int commentId)
        {
            var comment = _commentService.GetCommentById(commentId);
            if (comment == null)
            {
                return NotFound();
            }
            return Ok(comment);
        }
        [HttpPost]
        public ActionResult<Comment> CreateComment(CreateCommentDto commentDto)
        {
            var comment = new Comment
            {
                CommentContent = commentDto.CommentContent,
                CreatedAt = DateTime.UtcNow,
                PostId = commentDto.PostId,
                AuthorId = commentDto.AuthorId
            };
            var createdComment = _commentService.CreateComment(comment);
            if(createdComment == null)
            {
                return BadRequest("Failed to create comment");
            }
            return CreatedAtAction(nameof(GetCommentById), new { id = createdComment.CommentId }, createdComment);
        }
        [HttpPut("{commentId}")]
        public ActionResult<Comment> UpdateComment(int commentId, UpdateCommentDto commentDto)
        {
            if (commentId != commentDto.CommentId)
            {
                return BadRequest("Comment ID mismatch");
            }
            var comment = new Comment
            {
                CommentId = commentDto.CommentId,
                CommentContent = commentDto.CommentContent,
                CreatedAt = DateTime.UtcNow,
                PostId = commentDto.PostId,
                AuthorId = commentDto.AuthorId
            };

            var updatedComment = _commentService.UpdateComment(comment);
            if (updatedComment == null)
            {
                return NotFound();
            }
            return Ok(updatedComment);
        }
        [HttpDelete("{commentId}")]
        public ActionResult DeleteComment(int commentId)
        {
            var result = _commentService.DeleteComment(commentId);
            if (!result)
            {
                return NotFound(new { message = "Comment not found" });
            }
            return Ok(new { message = "Comment deleted successfully" });
        }

    }
}
