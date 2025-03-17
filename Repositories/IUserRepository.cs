using WebAPIDemo.Models;

namespace WebAPIDemo.Repositories
{
    public interface IUserRepository
    {
        User create(User user);
        List<User> getAll();
        User getOne(int userId);
        User update(User user);
        int delete(int userId);

    }
}
