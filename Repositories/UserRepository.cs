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

        public User? create(User user)
        {
            _dataContext.Users.Add(user);
            _dataContext.SaveChanges();
            return _dataContext.Users.Find(user.UserId);
        }

        public List<User> getAll()
        {
            return _dataContext.Users
                .Include(t => t.AuthoredReservations)
                .Include(t => t.ParticipatingReservations)
                .ToList();
        }

        public User? getOne(int UserId)
        {
            return _dataContext.Users
                .Include(t => t.AuthoredReservations)
                .Include(t => t.ParticipatingReservations)
                .FirstOrDefault(t => t.UserId == UserId);
        }

        public User update(User newUser)
        {
            var dbUser = _dataContext.Users.Find(newUser.UserId) 
                ?? throw new Exception("No user with id " + newUser.UserId);
                
            dbUser.Username = newUser.Username;
            dbUser.Email = newUser.Email;
            dbUser.AuthoredReservations = newUser.AuthoredReservations;
            dbUser.ParticipatingReservations = newUser.ParticipatingReservations;
            _dataContext.SaveChanges();
            
            return dbUser;
        }

        public int delete(int UserId)
        {
            var user = _dataContext.Users.Find(UserId) 
                ?? throw new Exception("No user with id " + UserId);
                
            _dataContext.Users.Remove(user);
            _dataContext.SaveChanges();
            return UserId;
        }
    }
}
