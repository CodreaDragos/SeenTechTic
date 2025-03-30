using WebAPIDemo.DTOs.Auth;

namespace WebAPIDemo.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> Login(LoginDto loginDto);
        Task<AuthResponseDto> Register(RegisterDto registerDto);
    }
} 