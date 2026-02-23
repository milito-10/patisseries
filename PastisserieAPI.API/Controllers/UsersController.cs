using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Services.DTOs.Common;
using PastisserieAPI.Services.DTOs.Request;
using PastisserieAPI.Services.DTOs.Response;

namespace PastisserieAPI.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // Solo Admin puede gestionar usuarios aquí
    public class UsersController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<UsersController> _logger;
        private readonly PastisserieAPI.Services.Services.Interfaces.IAuthService _authService;

        public UsersController(IUnitOfWork unitOfWork, IMapper mapper, ILogger<UsersController> logger, PastisserieAPI.Services.Services.Interfaces.IAuthService authService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
            _authService = authService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _unitOfWork.Users.GetAllAsync();
            // Sería ideal traer los roles también. Asumimmos que MappingProfile maneja User -> UserResponseDto
            var usersDto = _mapper.Map<List<UserResponseDto>>(users);
            return Ok(ApiResponse<List<UserResponseDto>>.SuccessResponse(usersDto));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null) return NotFound(ApiResponse.ErrorResponse("Usuario no encontrado"));
            
            var userDto = _mapper.Map<UserResponseDto>(user);
            return Ok(ApiResponse<UserResponseDto>.SuccessResponse(userDto));
        }

        /// <summary>
        /// Actualizar datos básicos o estado de un usuario
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserRequestDto request)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null) return NotFound(ApiResponse.ErrorResponse("Usuario no encontrado"));

            // Mapear cambios (Nombre, Email, etc)
            // Nota: No permitimos cambio de password aquí, eso va por AuthController aparte o lógica segura
            _mapper.Map(request, user);
            
            // Forzar actualización de fecha
            user.FechaActualizacion = DateTime.UtcNow;

            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            var userDto = _mapper.Map<UserResponseDto>(user);
            return Ok(ApiResponse<UserResponseDto>.SuccessResponse(userDto, "Usuario actualizado correctamente"));
        }

        /// <summary>
        /// Cambiar solo el estado Activo/Inactivo
        /// </summary>
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ToggleStatus(int id, [FromBody] bool activo)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null) return NotFound(ApiResponse.ErrorResponse("Usuario no encontrado"));

            if (user.Email == "admin@patisserie.com" && !activo)
            {
                return BadRequest(ApiResponse.ErrorResponse("No puedes desactivar al Super Admin principal."));
            }

            user.Activo = activo;
            user.FechaActualizacion = DateTime.UtcNow;

            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            return Ok(ApiResponse.SuccessResponse($"El usuario ha sido {(activo ? "activado" : "desactivado")}."));
        }

        /// <summary>
        /// Crear nuevo usuario (Solo Admin)
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserRequestDto request)
        {
            // Validar que las contraseñas coincidan
            if (request.Password != request.ConfirmPassword)
            {
                return BadRequest(ApiResponse.ErrorResponse("Las contraseñas no coinciden."));
            }

            var user = await _authService.CreateUserAsync(request);
            if (user == null)
            {
                return BadRequest(ApiResponse.ErrorResponse("El email ya está registrado o el rol no existe."));
            }

            return Ok(ApiResponse<UserResponseDto>.SuccessResponse(user, "Usuario creado exitosamente."));
        }

        /// <summary>
        /// Cambiar rol de usuario
        /// </summary>
        [HttpPatch("{id}/role")]
        public async Task<IActionResult> ChangeRole(int id, [FromBody] ChangeRoleRequestDto request)
        {
             if (id == 0) return BadRequest(ApiResponse.ErrorResponse("ID inválido"));

             // Protección: No quitar admin al super admin
             var user = await _unitOfWork.Users.GetByIdAsync(id);
             if (user != null && user.Email == "admin@patisserie.com" && request.NuevoRol != "Admin")
             {
                 return BadRequest(ApiResponse.ErrorResponse("No se puede cambiar el rol del Super Admin principal."));
             }

             var result = await _authService.ChangeUserRoleAsync(id, request.NuevoRol);
             if (!result)
             {
                 return BadRequest(ApiResponse.ErrorResponse("No se pudo cambiar el rol. Verifica que el usuario y el rol existan."));
             }

             return Ok(ApiResponse.SuccessResponse($"Rol actualizado a '{request.NuevoRol}' exitosamente."));
        }
    }
}
