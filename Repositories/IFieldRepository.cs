using WebAPIDemo.Models;

namespace WebAPIDemo.Repositories
{
    public interface IFieldRepository
    {
        Field? create(Field field);
        List<Field> getAll();
        Field? getOne(int fieldId);
        Field? update(Field field);
        int delete(int fieldId);
    }
} 