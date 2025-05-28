namespace WebAPIDemo.DTOs.Reservation
{
    public class CreateReservationDto
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int FieldId { get; set; }
        public int AuthorId { get; set; }
        public List<string> ParticipantUsernames { get; set; } = new List<string>();
    }   
} 