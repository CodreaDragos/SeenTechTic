using System.ComponentModel.DataAnnotations.Schema;

namespace WebAPIDemo.Models
{
    public class Field
    {
        public Field()
        {
            Reservations = new List<Reservation>();
        }

        [Column("field_id")]
        public int FieldId { get; set; }

        [Column("field_name")]
        public string FieldName { get; set; } = string.Empty;

        [Column("sport_type")]
        public SportType SportType { get; set; }

        [Column("isReserved")]
        public Boolean IsReserved { get; set; }

        public List<Reservation> Reservations { get; set; }
    }
}