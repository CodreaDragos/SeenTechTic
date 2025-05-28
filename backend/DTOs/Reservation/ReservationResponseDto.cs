using System;

namespace WebAPIDemo.DTOs.Reservation
{
    public class ReservationResponseDto
    {
        public int ReservationId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int AuthorId { get; set; }
        public int FieldId { get; set; }

        // Aici adaugi lista de participanți
        public List<UserDisplayDto> Participants { get; set; } = new List<UserDisplayDto>();
    }
}
