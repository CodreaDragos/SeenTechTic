using System.ComponentModel.DataAnnotations;

namespace WebAPIDemo.DTOs.Auth
{
    public class LoginDto
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [RegularExpression(@"^[^\s@]+@[^\s@]+\.[^\s@]+$", ErrorMessage = "Invalid email format. Must be in the format user@domain.com")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        [RegularExpression(@"^(?!.*\s{2,})(?!.*\s$).*$", ErrorMessage = "Password cannot contain multiple consecutive spaces or end with spaces")]
        public string Password { get; set; } = string.Empty;
    }
} 