using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PastisserieAPI.Services.DTOs.Common;
using PastisserieAPI.Services.DTOs.Response;
using PastisserieAPI.Services.Services.Interfaces;
using System.Security.Claims;

namespace PastisserieAPI.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class NotificacionesController : ControllerBase
    {
        private readonly INotificacionService _notificacionService;

        public NotificacionesController(INotificacionService notificacionService)
        {
            _notificacionService = notificacionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMisNotificaciones()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized(ApiResponse<string>.ErrorResponse("Usuario no identificado"));

            var notificaciones = await _notificacionService.GetByUsuarioIdAsync(userId);
            return Ok(ApiResponse<List<NotificacionResponseDto>>.SuccessResponse(notificaciones));
        }

        [HttpPut("{id}/leer")]
        public async Task<IActionResult> MarcarLeida(int id)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized(ApiResponse<string>.ErrorResponse("Usuario no identificado"));

            var result = await _notificacionService.MarcarComoLeidaAsync(id, userId);
            if (!result) return NotFound(ApiResponse<string>.ErrorResponse("Notificación no encontrada o no pertenece al usuario"));

            return Ok(ApiResponse<bool>.SuccessResponse(true, "Notificación marcada como leída"));
        }

        [HttpPut("leer-todas")]
        public async Task<IActionResult> MarcarTodasLeidas()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized(ApiResponse<string>.ErrorResponse("Usuario no identificado"));

            await _notificacionService.MarcarTodasComoLeidasAsync(userId);
            return Ok(ApiResponse<bool>.SuccessResponse(true, "Todas las notificaciones marcadas como leídas"));
        }
    }
}
