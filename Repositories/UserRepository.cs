using Microsoft.EntityFrameworkCore;
using WebAPIDemo.Data;
using WebAPIDemo.Models;

namespace WebAPIDemo.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly DataContext _dataContext;

        public UserRepository(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        public User create(User user)
        {
            _dataContext.Users.Add(user);
            _dataContext.SaveChanges();
            return _dataContext.Users.Find(user.UserId);
        }

        public List<User> getAll()
        {
            return _dataContext.Users.Include(t => t.Reservations).ToList();
        }
        public User getOne(int UserId)
        {
            return _dataContext.Users.Include(t => t.Reservations).FirstOrDefault(t => t.UserId == UserId);
        }

        public User update(User newUser)
        {
            User dbUser = _dataContext.Users.Find(newUser.UserId);
            if (dbUser == null)
                throw new Exception("No user with id " + newUser.UserId);
            dbUser.Username = newUser.Username;
            dbUser.Email = newUser.Email;
            dbUser.Reservations = newUser.Reservations;
            _dataContext.SaveChanges();
            return getOne(dbUser.UserId);
        }

        public int delete(int UserId)
        {
            User User = _dataContext.Users.Find(UserId);
            _dataContext.Users.Remove(User);
            _dataContext.SaveChanges();
            return UserId;
        }
    }
}
