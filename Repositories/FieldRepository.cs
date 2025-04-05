using WebAPIDemo.Models;
using WebAPIDemo.Data;
using Microsoft.EntityFrameworkCore;

namespace WebAPIDemo.Repositories
{
    public class FieldRepository : IFieldRepository
    {
        private readonly DataContext _context;

        public FieldRepository(DataContext context)
        {
            _context = context;
        }

        public Field? create(Field field)
        {
            _context.Fields.Add(field);
            _context.SaveChanges();
            return field;
        }

        public List<Field> getAll()
        {
            return _context.Fields.ToList();
        }

        public Field? getOne(int fieldId)
        {
            return _context.Fields.Find(fieldId);
        }

        public Field? update(Field field)
        {
            _context.Fields.Update(field);
            _context.SaveChanges();
            return field;
        }

        public int delete(int fieldId)
        {
            var field = _context.Fields.Find(fieldId);
            if (field != null)
            {
                _context.Fields.Remove(field);
                return _context.SaveChanges();
            }
            return 0;
        }
    }
} 