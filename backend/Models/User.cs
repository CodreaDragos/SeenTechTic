using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace WebAPIDemo.Models
{
    public class User
    {
        public User()
        {
            AuthoredReservations = new List<Reservation>();
            ParticipatingReservations = new List<Reservation>();
            Posts = new List<Post>();
            Comments = new List<Comment>();
        }

        [Column("user_id")]
        public int UserId { get; set; }
        [Column("username")]
        [Required]
        public string Username { get; set; } = string.Empty;
        [Column("password")]
        [Required]
        public string Password { get; set; } = string.Empty;
        [Column("role")]
        public string Role { get; set; } = string.Empty;
        [Column("email")]
        [Required]
        [EmailAddress(ErrorMessage = "Invalid email format. Must be in the format user@domain.com")]
        [RegularExpression(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", ErrorMessage = "Invalid email format. Must be in the format user@domain.com")]
        public string Email { get; set; } = string.Empty;
        [Column("profile_picture")]
        public string ProfilePicture { get; set; } = string.Empty;
        [Column("Reservations")]
        public List<Reservation> AuthoredReservations { get; set; }
        [Column("Reservations")]
        public List<Reservation> ParticipatingReservations { get; set; }
        [Column("Posts")]
        public List<Post> Posts { get; set; }
        [Column("Comments")]
        public List<Comment> Comments { get; set; }
    }
}
