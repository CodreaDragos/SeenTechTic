using Microsoft.AspNetCore.Mvc;
using WebAPIDemo.Models;
using WebAPIDemo.Services;
using Microsoft.AspNetCore.Authorization;

namespace WebAPIDemo.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/users")]
    public class UserController : Controller
    {
        public class UserProfileDto
        {
            public int UserId { get; set; }
            public string Username { get; set; } = string.Empty;
            public string? PhotoUrl { get; set; }
            // Add other properties as needed
        }

        private readonly IUserService _service;

        public UserController(IUserService service)
        {
            _service = service;
        }

        [HttpPost]
        public ActionResult create([FromBody] User user)
        {
            return Ok(_service.create(user));
        }

        [HttpGet]
        public ActionResult<List<User>> getAll()
        {
            return Ok(_service.getAll());
        }

        [HttpGet("{id}")]
        public ActionResult<User> get(int id)
        {
            return Ok(_service.getOne(id));
        }

        [HttpGet("profile")]
        public ActionResult<UserProfileDto> getProfile()
        {
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id");
            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            if (!int.TryParse(userIdClaim.Value, out int userId))
            {
                return BadRequest("Invalid user ID claim");
            }

            var user = _service.getOne(userId);
            if (user == null)
            {
                return NotFound();
            }

            var dto = new UserProfileDto
            {
                UserId = user.UserId,
                Username = user.Username,
                PhotoUrl = string.IsNullOrEmpty(user.ProfilePicture) ? null : "data:image/png;base64," + user.ProfilePicture
            };

            return Ok(dto);
        }

        [HttpPut("{id}")]
        public ActionResult<User> update(int id, [FromBody] User user)
        {
            if (id != user.UserId)
                return BadRequest("Path id does not match the body id");
            return Ok(_service.update(user));
        }

        [HttpDelete]
        public ActionResult<int> delete(int id)
        {
            return Ok(_service.delete(id));
        }

        private static string HashPassword(string password)
        {
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([
            FromForm] string? username,
            [FromForm] string? password,
            [FromForm] IFormFile? profilePicture)
        {
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized();

            var user = _service.getOne(userId);
            if (user == null)
                return NotFound();

            if (!string.IsNullOrEmpty(username))
                user.Username = username;
            if (!string.IsNullOrEmpty(password))
                user.Password = HashPassword(password); // Hash the password!

            if (profilePicture != null)
            {
                using var ms = new MemoryStream();
                await profilePicture.CopyToAsync(ms);
                var bytes = ms.ToArray();
                user.ProfilePicture = Convert.ToBase64String(bytes);
            }

            _service.update(user);

            var dto = new UserProfileDto
            {
                UserId = user.UserId,
                Username = user.Username,
                PhotoUrl = string.IsNullOrEmpty(user.ProfilePicture) ? null : "data:image/png;base64," + user.ProfilePicture
            };

            return Ok(dto);
        }

    }
}
