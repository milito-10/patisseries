using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PastisserieAPI.Infrastructure.Data;
using PastisserieAPI.Core.Entities;

namespace PastisserieAPI.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SetupController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SetupController> _logger;

        public SetupController(ApplicationDbContext context, ILogger<SetupController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// ENDPOINT TEMPORAL: Configurar usuario administrador
        /// </summary>
        [HttpPost("setup-admin")]
        public async Task<IActionResult> SetupAdmin()
        {
            try
            {
                // Buscar o crear el usuario administrador
                var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == 1);

                if (adminUser == null)
                {
                    _logger.LogInformation("No existe usuario con ID 1. Creando...");
                    adminUser = new User
                    {
                        Nombre = "Admin Deluxe",
                        Email = "administrador123@gmail.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123"),
                        EmailVerificado = true,
                        Activo = true,
                        FechaRegistro = DateTime.UtcNow,
                        FechaCreacion = DateTime.UtcNow
                    };
                    _context.Users.Add(adminUser);
                }
                else
                {
                    _logger.LogInformation($"Usuario encontrado: {adminUser.Email}. Actualizando credenciales...");
                    adminUser.Nombre = "Admin Deluxe";
                    adminUser.Email = "administrador123@gmail.com";
                    adminUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123");
                    adminUser.EmailVerificado = true;
                    adminUser.Activo = true;
                    _context.Users.Update(adminUser);
                }

                await _context.SaveChangesAsync();

                // Asegurar que tiene el rol de Admin
                var adminRole = await _context.Roles.FirstOrDefaultAsync(r => r.Nombre == "Admin");
                if (adminRole != null)
                {
                    var userRole = await _context.UserRoles
                        .FirstOrDefaultAsync(ur => ur.UsuarioId == adminUser.Id && ur.RolId == adminRole.Id);
                    
                    if (userRole == null)
                    {
                        _logger.LogInformation("Asignando rol de Admin...");
                        _context.UserRoles.Add(new UserRol
                        {
                            UsuarioId = adminUser.Id,
                            RolId = adminRole.Id,
                            FechaAsignacion = DateTime.UtcNow
                        });
                        await _context.SaveChangesAsync();
                    }
                }

                return Ok(new
                {
                    success = true,
                    message = "✅ Usuario administrador configurado correctamente",
                    credentials = new
                    {
                        email = "administrador123@gmail.com",
                        password = "Admin123",
                        role = "Admin"
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al configurar usuario administrador");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error al configurar usuario administrador",
                    error = ex.Message
                });
            }
        }
    }
}
