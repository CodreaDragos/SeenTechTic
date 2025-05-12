using WebAPIDemo.Models;

namespace WebAPIDemo.Repositories
{
    public interface IAuthRepository
    {
        Task<User?> GetUserByEmail(string email);
        Task<bool> EmailExists(string email);
        Task<bool> UsernameExists(string username);
    }
} 