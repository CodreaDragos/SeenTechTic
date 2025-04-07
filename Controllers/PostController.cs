using Microsoft.AspNetCore.Mvc;
using WebAPIDemo.Models;
using WebAPIDemo.Services;
using WebAPIDemo.DTOs.Post;

namespace WebAPIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostController : ControllerBase
    {
        private readonly IPostService _postService;

        public PostController(IPostService postService)
        {
            _postService = postService;
        }

        [HttpGet]
        public ActionResult<List<Post>> GetAllPosts()
        {
            var posts = _postService.GetAllPosts();
            return Ok(posts);
        }

        [HttpGet("{postId}")]
        public ActionResult<Post> GetPost(int postId)
        {
            var post = _postService.GetPostById(postId);
            if (post == null)
            {
                return NotFound();
            }
            return Ok(post);
        }

        [HttpPost]
        public ActionResult<Post> CreatePost(CreatePostDto postDto)
        {
            var post = new Post
            {
                PostTitle = postDto.PostTitle,
                PostDescription = postDto.PostDescription,
                AuthorId = postDto.AuthorId,
                ReservationId = postDto.ReservationId,
                CreatedAt = DateTime.Now
            };

            var createdPost = _postService.CreatePost(post);
            if (createdPost == null)
            {
                return BadRequest();
            }

            return CreatedAtAction(nameof(GetPost), new { postId = createdPost.PostId }, createdPost);
        }

        [HttpPut("{postId}")]
        public ActionResult<Post> UpdatePost(int postId, UpdatePostDto postDto)
        {
            if (postId != postDto.PostId)
            {
                return BadRequest();
            }

            var post = new Post
            {
                PostId = postDto.PostId,
                PostTitle = postDto.PostTitle,
                PostDescription = postDto.PostDescription,
                AuthorId = postDto.AuthorId,
                ReservationId = postDto.ReservationId
            };

            var updatedPost = _postService.UpdatePost(post);
            if (updatedPost == null)
            {
                return NotFound();
            }

            return Ok(updatedPost);
        }

        [HttpDelete("{postId}")]
        public ActionResult DeletePost(int postId)
        {
            var result = _postService.DeletePost(postId);
            if (!result)
            {
                return NotFound(new { message = "Post not found" });
            }

            return Ok(new { message = "Post deleted successfully" });
        }
    }
}
