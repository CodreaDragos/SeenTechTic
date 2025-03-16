using System.ComponentModel.DataAnnotations.Schema;

namespace WebAPIDemo.Models
{
    public class User
    {
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
        [Column("Reservations")]
        public List<Reservation> Reservations { get; set; }

        [Column("Posts")]
        public List<Post> Posts { get; set; }

        [Column("Comments")]
        public List<Comment> Comments { get; set; }
    }
}
