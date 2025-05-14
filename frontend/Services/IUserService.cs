using WebAPIDemo.Models;

namespace WebAPIDemo.Services
{
    public interface IUserService
    {
        User create(User User);
        User getOne(int UserId);
        List<User> getAll();
        User update(User User);
        int delete(int UserId);
    }
}
