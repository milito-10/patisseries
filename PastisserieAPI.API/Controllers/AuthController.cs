using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PastisserieAPI.Services.DTOs.Request;
using PastisserieAPI.Services.DTOs.Response;
using PastisserieAPI.Services.DTOs.Common;
using PastisserieAPI.Services.Services.Interfaces;
using System.Security.Claims;

namespace PastisserieAPI.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthController> _logger;
        private readonly IConfiguration _config;

        public AuthController(IAuthService authService, IEmailService emailService, ILogger<AuthController> logger, IConfiguration config)
        {
            _authService = authService;
            _emailService = emailService;
            _logger = logger;
            _config = config;
        }

        /// <summary>
        /// Registrar nuevo usuario
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            var user = await _authService.RegisterAsync(request);

            if (user == null)
            {
                return BadRequest(ApiResponse<UserResponseDto>.ErrorResponse(
                    "El email ya está registrado"
                ));
            }

            return Ok(ApiResponse<UserResponseDto>.SuccessResponse(
                user,
                "Usuario registrado exitosamente"
            ));
        }

        /// <summary>
        /// Iniciar sesión
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            var response = await _authService.LoginAsync(request);

            if (response == null)
            {
                return Unauthorized(ApiResponse<LoginResponseDto>.ErrorResponse(
                    "Email o contraseña incorrectos"
                ));
            }

            return Ok(ApiResponse<LoginResponseDto>.SuccessResponse(
                response,
                "Inicio de sesión exitoso"
            ));
        }

        /// <summary>
        /// Cambiar contraseña (requiere autenticación)
        /// </summary>
        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized(ApiResponse.ErrorResponse("Usuario no autenticado"));
            }

            var userId = int.Parse(userIdClaim.Value);
            var result = await _authService.ChangePasswordAsync(userId, request);

            if (!result)
            {
                return BadRequest(ApiResponse.ErrorResponse(
                    "La contraseña actual es incorrecta"
                ));
            }

            return Ok(ApiResponse.SuccessResponse("Contraseña actualizada exitosamente"));
        }

        /// <summary>
        /// Obtener perfil del usuario autenticado
        /// </summary>
        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized(ApiResponse<UserResponseDto>.ErrorResponse(
                    "Usuario no autenticado"
                ));
            }

            var userId = int.Parse(userIdClaim.Value);
            var user = await _authService.GetUserByIdAsync(userId);

            if (user == null)
            {
                return NotFound(ApiResponse<UserResponseDto>.ErrorResponse(
                    "Usuario no encontrado"
                ));
            }

            return Ok(ApiResponse<UserResponseDto>.SuccessResponse(user));
        }

        /// <summary>
        /// Obtener todos los usuarios (Solo Admin)
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _authService.GetAllUsersAsync();
            return Ok(ApiResponse<List<UserResponseDto>>.SuccessResponse(users));
        }

        /// <summary>
        /// Verificar si el token es válido (solo para testing)
        /// </summary>
        [Authorize]
        [HttpGet("verify")]
        public IActionResult VerifyToken()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value;
            var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

            return Ok(ApiResponse<object>.SuccessResponse(new
            {
                userId,
                email,
                name,
                roles
            }, "Token válido"));
        }
        /// <summary>
        /// Solicitar recuperación de contraseña
        /// </summary>
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
        {
            try
            {
                var token = await _authService.ForgotPasswordAsync(request.Email);
                
                if (string.IsNullOrEmpty(token))
                {
                    return BadRequest(ApiResponse.ErrorResponse("El correo electrónico no está registrado en nuestro sistema."));
                }

                // Obtener URL base del frontend desde config (mejor que hardcoded)
                var frontendUrl = _config["FrontendUrl"] ?? "http://localhost:5173";
                
                // IMPORTANTE: Codificar el token para evitar problemas con caracteres especiales (+, /, etc)
                var encodedToken = System.Web.HttpUtility.UrlEncode(token);
                var encodedEmail = System.Web.HttpUtility.UrlEncode(request.Email);
                
                var recoveryLink = $"{frontendUrl.TrimEnd('/')}/reset-password?token={encodedToken}&email={encodedEmail}";

                // Enviar correo real usando la plantilla profesional
                try 
                {
                    await _emailService.SendPasswordResetEmailAsync(request.Email, recoveryLink);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "No se pudo enviar el correo real.");
                    // Devolvemos el token en la data para fallback pero con mensaje informativo
                    return BadRequest(ApiResponse<object>.ErrorResponseWithData(
                        "No se pudo enviar el correo de recuperación. Por favor verifica los ajustes de Gmail o usa el token simulado.",
                        new { token }
                    ));
                }
                
                return Ok(ApiResponse<object>.SuccessResponse(
                    new { token }, 
                    "¡Correo enviado correctamente! Revisa tu bandeja de entrada."
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error crítico en ForgotPassword");
                return StatusCode(500, ApiResponse.ErrorResponse($"Error al procesar la solicitud: {ex.Message}"));
            }
        }

        /// <summary>
        /// Verificar si un token de restablecimiento es válido
        /// </summary>
        [HttpGet("verify-reset-token")]
        public async Task<IActionResult> VerifyResetToken([FromQuery] string email, [FromQuery] string token)
        {
            var isValid = await _authService.ValidateResetTokenAsync(email, token);
            if (!isValid)
            {
                return BadRequest(ApiResponse.ErrorResponse("El token es inválido o ha expirado."));
            }

            return Ok(ApiResponse.SuccessResponse("Token válido."));
        }

        /// <summary>
        /// Restablecer contraseña con token
        /// </summary>
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request)
        {
            var result = await _authService.ResetPasswordAsync(request);
            if (!result)
            {
                return BadRequest(ApiResponse.ErrorResponse("El token es inválido o ha expirado."));
            }

            return Ok(ApiResponse.SuccessResponse("Contraseña restablecida exitosamente."));
        }
    }
}