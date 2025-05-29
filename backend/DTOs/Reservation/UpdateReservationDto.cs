namespace WebAPIDemo.DTOs.Reservation
{
    public class UpdateReservationDto
    {
        public int ReservationId { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public int? FieldId { get; set; }
        public int? AuthorId { get; set; }
        public List<int>? ParticipantIds { get; set; } = new List<int>();
    }
} 