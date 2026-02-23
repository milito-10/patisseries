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
    public class CarritoController : ControllerBase
    {
        private readonly ICarritoService _carritoService;
        private readonly ILogger<CarritoController> _logger;

        public CarritoController(ICarritoService carritoService, ILogger<CarritoController> logger)
        {
            _carritoService = carritoService;
            _logger = logger;
        }

        private int GetUsuarioId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        }

        /// <summary>
        /// Obtener carrito del usuario autenticado
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetCarrito()
        {
            try
            {
                var usuarioId = GetUsuarioId();

                if (usuarioId == 0)
                {
                    return Unauthorized(ApiResponse<CarritoResponseDto>.ErrorResponse(
                        "Usuario no autenticado"
                    ));
                }

                var carrito = await _carritoService.GetByUsuarioIdAsync(usuarioId);

                return Ok(ApiResponse<CarritoResponseDto>.SuccessResponse(carrito!));
            }
            catch (Exception ex)
            {
                 // LOGGING A ARCHIVO
                try {
                    var logPath = Path.Combine(Directory.GetCurrentDirectory(), "logs");
                    if (!Directory.Exists(logPath)) Directory.CreateDirectory(logPath);
                    System.IO.File.AppendAllText(Path.Combine(logPath, "carrito_error.txt"), 
                        $"{DateTime.Now}: {ex.Message}\n{ex.StackTrace}\n\n");
                } catch { }
                return StatusCode(500, ApiResponse<CarritoResponseDto>.ErrorResponse("Error interno: " + ex.Message));
            }
        }

        /// <summary>
        /// Agregar producto al carrito
        /// </summary>
        [HttpPost("items")]
        public async Task<IActionResult> AddItem([FromBody] AddToCarritoRequestDto request)
        {
            var usuarioId = GetUsuarioId();

            if (usuarioId == 0)
            {
                return Unauthorized(ApiResponse<CarritoResponseDto>.ErrorResponse(
                    "Usuario no autenticado"
                ));
            }

            var carrito = await _carritoService.AddItemAsync(usuarioId, request);

            return Ok(ApiResponse<CarritoResponseDto>.SuccessResponse(
                carrito,
                "Producto agregado al carrito"
            ));
        }

        /// <summary>
        /// Actualizar cantidad de un item
        /// </summary>
        [HttpPut("items/{itemId}")]
        public async Task<IActionResult> UpdateItem(int itemId, [FromBody] UpdateCarritoItemRequestDto request)
        {
            var usuarioId = GetUsuarioId();

            if (usuarioId == 0)
            {
                return Unauthorized(ApiResponse<CarritoResponseDto>.ErrorResponse(
                    "Usuario no autenticado"
                ));
            }

            var carrito = await _carritoService.UpdateItemAsync(usuarioId, itemId, request);

            if (carrito == null)
            {
                return NotFound(ApiResponse<CarritoResponseDto>.ErrorResponse(
                    "Item no encontrado en el carrito"
                ));
            }

            return Ok(ApiResponse<CarritoResponseDto>.SuccessResponse(
                carrito,
                "Cantidad actualizada"
            ));
        }

        /// <summary>
        /// Eliminar item del carrito
        /// </summary>
        [HttpDelete("items/{itemId}")]
        public async Task<IActionResult> RemoveItem(int itemId)
        {
            var usuarioId = GetUsuarioId();

            if (usuarioId == 0)
            {
                return Unauthorized(ApiResponse.ErrorResponse("Usuario no autenticado"));
            }

            var result = await _carritoService.RemoveItemAsync(usuarioId, itemId);

            if (!result)
            {
                return NotFound(ApiResponse.ErrorResponse("Item no encontrado"));
            }

            return Ok(ApiResponse.SuccessResponse("Item eliminado del carrito"));
        }

        /// <summary>
        /// Vaciar carrito
        /// </summary>
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCarrito()
        {
            var usuarioId = GetUsuarioId();

            if (usuarioId == 0)
            {
                return Unauthorized(ApiResponse.ErrorResponse("Usuario no autenticado"));
            }

            var result = await _carritoService.ClearCarritoAsync(usuarioId);

            if (!result)
            {
                return NotFound(ApiResponse.ErrorResponse("Carrito no encontrado"));
            }

            return Ok(ApiResponse.SuccessResponse("Carrito vaciado"));
        }
    }
}