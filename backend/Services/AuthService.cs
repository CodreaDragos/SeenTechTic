using System.Security.Cryptography;
using System.Text;
using WebAPIDemo.DTOs;
using WebAPIDemo.DTOs.Auth;
using WebAPIDemo.Models;
using WebAPIDemo.Repositories;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

namespace WebAPIDemo.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IAuthRepository authRepository, IUserRepository userRepository, IConfiguration configuration)
        {
            _authRepository = authRepository;
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto> Login(LoginDto loginDto)
        {
            var user = await _authRepository.GetUserByEmail(loginDto.Email);
            
            if (user == null)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "User not found"
                };
            }

            if (!VerifyPassword(loginDto.Password, user.Password))
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid password"
                };
            }

            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Success = true,
                Message = "Login successful",
                Token = token,
                User = new UserDto
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.Role
                }
            };
        }

        public async Task<AuthResponseDto> Register(RegisterDto registerDto)
        {
            // Backend validation check (redundant but good practice)
            // These checks are already on RegisterDto, but explicit checks here can return specific messages
            if (registerDto.Password != registerDto.ConfirmPassword)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Passwords do not match"
                };
            }

            // Use the IsValidEmail logic with a specific message
            if (!IsValidEmail(registerDto.Email))
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid email format. Must be in the format user@domain.com"
                };
            }

            // Check if email exists
            if (await _authRepository.EmailExists(registerDto.Email))
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Email already exists"
                };
            }

            // Check if username exists
            if (await _authRepository.UsernameExists(registerDto.Username))
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Username already exists"
                };
            }

            // Proceed with user creation if all checks pass
            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                Password = HashPassword(registerDto.Password),
                Role = "User" // Default role
            };

            var createdUser = _userRepository.create(user);

            return new AuthResponseDto
            {
                Success = true,
                Message = "Registration successful",
                User = new UserDto
                {
                    UserId = createdUser.UserId,
                    Username = createdUser.Username,
                    Email = createdUser.Email,
                    Role = createdUser.Role
                }
            };
        }

        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                // Check if the address object was successfully created and the address matches the input
                // Also check for at least one dot after the @ symbol
                return addr.Address == email && email.Contains(".") && email.IndexOf('.', email.IndexOf('@') + 1) > email.IndexOf('@');
            }
            catch
            {
                return false;
            }
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        private bool VerifyPassword(string password, string hashedPassword)
        {
            return HashPassword(password) == hashedPassword;
        }

        private string GenerateJwtToken(User user)
        {
            var secretKey = _configuration.GetValue<string>("JwtSettings:SecretKey");
            if (string.IsNullOrEmpty(secretKey))
            {
                throw new ArgumentNullException("JWT Secret Key is not configured.");
            }
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim("id", user.UserId.ToString()),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: null,
                audience: null,
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
