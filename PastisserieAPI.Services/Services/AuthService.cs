// ===================================================================
// ARCHIVO: PastisserieAPI.Services/Services/AuthService.cs
// ===================================================================
using AutoMapper;
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Services.DTOs.Request;
using PastisserieAPI.Services.DTOs.Response;
using PastisserieAPI.Services.Helpers;
using PastisserieAPI.Services.Services.Interfaces;
using BCrypt.Net;
using Microsoft.Extensions.Configuration;

namespace PastisserieAPI.Services.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly JwtHelper _jwtHelper;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public AuthService(IUnitOfWork unitOfWork, IMapper mapper, JwtHelper jwtHelper, IEmailService emailService, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _jwtHelper = jwtHelper;
            _emailService = emailService;
            _configuration = configuration;
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
        {
            // Buscar usuario por email con roles
            var user = await _unitOfWork.Users.GetByEmailWithRolesAsync(request.Email);

            if (user == null || !user.Activo)
                return null;

            // Verificar contraseña
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return null;

            // Obtener roles
            var roles = user.UserRoles.Select(ur => ur.Rol.Nombre).ToList();

            // Generar token
            var token = _jwtHelper.GenerateToken(user, roles);

            // Actualizar último acceso
            user.UltimoAcceso = DateTime.UtcNow;
            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            var userDto = _mapper.Map<UserResponseDto>(user);

            return new LoginResponseDto
            {
                Token = token,
                Expiration = DateTime.UtcNow.AddHours(1),
                User = userDto
            };
        }

        public async Task<UserResponseDto?> RegisterAsync(RegisterRequestDto request)
        {
            // Verificar si el email ya existe
            if (await _unitOfWork.Users.EmailExistsAsync(request.Email))
                return null;

            // Crear usuario
            var user = _mapper.Map<User>(request);
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.SaveChangesAsync();

            // Asignar rol por defecto "Usuario"
            var rolUsuario = await _unitOfWork.Roles.FirstOrDefaultAsync(r => r.Nombre == "Usuario");

            if (rolUsuario != null)
            {
                var userRol = new UserRol
                {
                    UsuarioId = user.Id,
                    RolId = rolUsuario.Id,
                    FechaAsignacion = DateTime.UtcNow
                };

                // CORRECCIÓN: Agregar el UserRol al repositorio
                await _unitOfWork.UserRoles.AddAsync(userRol);
                await _unitOfWork.SaveChangesAsync();
            }

            // Crear carrito para el usuario
            var carrito = new CarritoCompra
            {
                UsuarioId = user.Id,
                FechaCreacion = DateTime.UtcNow
            };

            await _unitOfWork.Carritos.AddAsync(carrito);
            await _unitOfWork.SaveChangesAsync();

            // Obtener usuario con roles
            var userWithRoles = await _unitOfWork.Users.GetByEmailWithRolesAsync(user.Email);

            // Enviar correo de bienvenida
            try { await _emailService.SendWelcomeEmailAsync(user.Email, user.Nombre); } catch { }

            return _mapper.Map<UserResponseDto>(userWithRoles);
        }

        public async Task<UserResponseDto?> CreateUserAsync(CreateUserRequestDto request)
        {
            if (await _unitOfWork.Users.EmailExistsAsync(request.Email))
                return null;

            var user = _mapper.Map<User>(request);
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.SaveChangesAsync();

            // Asignar rol especificado
            var rol = await _unitOfWork.Roles.FirstOrDefaultAsync(r => r.Nombre == request.Rol);
            if (rol == null) 
            {
                 // Si el rol no existe, asignar Usuario por defecto o fallar
                 rol = await _unitOfWork.Roles.FirstOrDefaultAsync(r => r.Nombre == "Usuario");
            }

            if (rol != null)
            {
                var userRol = new UserRol
                {
                    UsuarioId = user.Id,
                    RolId = rol.Id,
                    FechaAsignacion = DateTime.UtcNow
                };
                await _unitOfWork.UserRoles.AddAsync(userRol);
                await _unitOfWork.SaveChangesAsync();
            }

            // Crear carrito
            var carrito = new CarritoCompra { UsuarioId = user.Id, FechaCreacion = DateTime.UtcNow };
            await _unitOfWork.Carritos.AddAsync(carrito);
            await _unitOfWork.SaveChangesAsync();

            var userWithRoles = await _unitOfWork.Users.GetByEmailWithRolesAsync(user.Email);
            return _mapper.Map<UserResponseDto>(userWithRoles);
        }

        public async Task<bool> ChangeUserRoleAsync(int userId, string nuevoRol)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null) return false;

            // Obtener el rol nuevo
            var rol = await _unitOfWork.Roles.FirstOrDefaultAsync(r => r.Nombre == nuevoRol);
            if (rol == null) return false; // Rol no existe

            // Eliminar roles actuales (o agregar lógica para múltiples roles si se desea)
            // Asumiremos un solo rol principal por ahora o reemplazo total
            var currentRoles = await _unitOfWork.UserRoles.FindAsync(ur => ur.UsuarioId == userId);
            
            // Usar DeleteRangeAsync que es la implementación expuesta en IRepository
            await _unitOfWork.UserRoles.DeleteRangeAsync(currentRoles);
            
            // Asignar nuevo rol
            var newRole = new UserRol
            {
                UsuarioId = userId,
                RolId = rol.Id,
                FechaAsignacion = DateTime.UtcNow
            };
            
            await _unitOfWork.UserRoles.AddAsync(newRole);
            await _unitOfWork.SaveChangesAsync();
            
            return true;
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequestDto request)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);

            if (user == null)
                return false;

            // Verificar contraseña actual
            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                return false;

            // Actualizar contraseña
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.FechaActualizacion = DateTime.UtcNow;

            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<UserResponseDto?> GetUserByIdAsync(int userId)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            return user == null ? null : _mapper.Map<UserResponseDto>(user);
        }

        public async Task<UserResponseDto?> GetUserByEmailAsync(string email)
        {
            var user = await _unitOfWork.Users.GetByEmailWithRolesAsync(email);
            return user == null ? null : _mapper.Map<UserResponseDto>(user);
        }

        // Simulación de tokens en memoria para el demo
        private static readonly Dictionary<string, string> _resetTokens = new Dictionary<string, string>();

        public async Task<string> ForgotPasswordAsync(string email)
        {
            var user = await _unitOfWork.Users.GetByEmailWithRolesAsync(email);
            if (user == null) return string.Empty;

            var token = Guid.NewGuid().ToString();
            _resetTokens[token] = email;

            // Enviar correo de recuperación
            try
            {
                // URL configurada para el frontend
                string frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
                string resetLink = $"{frontendUrl}/reset-password?token={token}&email={email}";
                await _emailService.SendPasswordResetEmailAsync(email, resetLink);
            }
            catch { }

            return token;
        }

        public async Task<bool> ValidateResetTokenAsync(string email, string token)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(token))
                return false;

            return _resetTokens.TryGetValue(token, out var storedEmail) && storedEmail == email;
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordRequestDto request)
        {
            if (!_resetTokens.TryGetValue(request.Token, out var email) || email != request.Email)
                return false;

            var user = await _unitOfWork.Users.GetByEmailWithRolesAsync(email);
            if (user == null) return false;

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.FechaActualizacion = DateTime.UtcNow;

            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            _resetTokens.Remove(request.Token);
            return true;
        }

        public async Task<List<UserResponseDto>> GetAllUsersAsync()
        {
            var users = await _unitOfWork.Users.GetAllWithRolesAsync();
            return _mapper.Map<List<UserResponseDto>>(users);
        }
    }
}