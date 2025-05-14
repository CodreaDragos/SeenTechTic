using Microsoft.AspNetCore.Mvc;
using WebAPIDemo.Models;
using WebAPIDemo.Services;

namespace WebAPIDemo.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : Controller
    {

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


    }
}
