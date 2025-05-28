using System.ComponentModel.DataAnnotations.Schema;

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
        public string Username { get; set; } = string.Empty;

        [Column("password")]
        public string Password { get; set; } = string.Empty;

        [Column("role")]
        public string Role { get; set; } = string.Empty;

        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Column("profile_picture")]
        public string ProfilePicture { get; set; } = string.Empty;

        public List<Reservation> AuthoredReservations { get; set; }

        public List<Reservation> ParticipatingReservations { get; set; }

        public List<Post> Posts { get; set; }

        public List<Comment> Comments { get; set; }
    }

}
