using WebAPIDemo.Models;
using WebAPIDemo.Repositories;

namespace WebAPIDemo.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _repository;

        public UserService(IUserRepository repository)
        {
            _repository = repository;
        }

        public User create(User User)
        {
            return _repository.create(User);
        }

        public User getOne(int UserId)
        {
            if (UserId == null)
                throw new Exception("User id cannot be null");
            return _repository.getOne(UserId);
        }

        public List<User> getAll()
        {
            return _repository.getAll();
        }

        public User update(User User)
        {
            if (User == null)
                throw new Exception("User object cannot be null");
            return _repository.update(User);
        }
        public int delete(int UserId)
        {
            if (UserId == null)
                throw new Exception("User id cannot be null");
            return _repository.delete(UserId);
        }
    }
}
