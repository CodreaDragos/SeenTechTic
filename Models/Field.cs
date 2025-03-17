using System.ComponentModel.DataAnnotations.Schema;

namespace WebAPIDemo.Models
{
    public class Field
    {
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