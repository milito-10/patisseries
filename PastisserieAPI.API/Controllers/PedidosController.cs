using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PastisserieAPI.Services.DTOs.Request;
using PastisserieAPI.Services.DTOs.Response;
using PastisserieAPI.Services.DTOs.Common;
using PastisserieAPI.Services.Services.Interfaces;
using System.Security.Claims;

namespace PastisserieAPI.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PedidosController : ControllerBase
    {
        private readonly IPedidoService _pedidoService;

        public PedidosController(IPedidoService pedidoService)
        {
            _pedidoService = pedidoService;
        }

        // 👇👇👇 ESTA ES LA PARTE QUE TE FALTABA 👇👇👇
        [HttpGet("todos")]
        public async Task<IActionResult> GetAllTodos()
        {
            // Usamos GetAllAsync (Asegúrate de tenerlo en tu IPedidoService)
            var pedidos = await _pedidoService.GetAllAsync();
            return Ok(ApiResponse<List<PedidoResponseDto>>.SuccessResponse(pedidos));
        }
        // 👆👆👆 FIN DE LA PARTE QUE FALTABA 👆👆👆

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePedidoRequestDto request)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized(ApiResponse<string>.ErrorResponse("Usuario no identificado en token"));

            var pedido = await _pedidoService.CreateAsync(userId, request);
            return Ok(ApiResponse<PedidoResponseDto>.SuccessResponse(pedido, "Pedido creado exitosamente"));
        }

        [HttpGet("mis-pedidos")]
        public async Task<IActionResult> GetMisPedidos()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized(ApiResponse<string>.ErrorResponse("Usuario no identificado en token"));

            var pedidos = await _pedidoService.GetByUsuarioIdAsync(userId);
            return Ok(ApiResponse<List<PedidoResponseDto>>.SuccessResponse(pedidos));
        }

        [HttpGet]
        // Este trae solo los pendientes (ruta por defecto)
        public async Task<IActionResult> GetAll()
        {
            var pedidos = await _pedidoService.GetPedidosPendientesAsync();
            return Ok(ApiResponse<List<PedidoResponseDto>>.SuccessResponse(pedidos));
        }

        [HttpPut("{id}/estado")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdatePedidoEstadoRequestDto request)
        {
            var result = await _pedidoService.UpdateEstadoAsync(id, request);
            if (result == null) return NotFound(ApiResponse<string>.ErrorResponse("Pedido no encontrado"));
            return Ok(ApiResponse<PedidoResponseDto>.SuccessResponse(result, "Estado actualizado"));
        }
    }
}