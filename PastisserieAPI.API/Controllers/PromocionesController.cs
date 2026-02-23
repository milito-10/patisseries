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
    public class PromocionesController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public PromocionesController(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try 
            {
                var promociones = await _unitOfWork.Promociones.GetAllAsync();
                
                // Si NO es admin, solo mostrar activas y que no hayan expirado
                if (!User.IsInRole("Admin"))
                {
                    var now = DateTime.Now;
                    promociones = promociones.Where(p => p.Activo && p.FechaInicio <= now && p.FechaFin >= now).ToList();
                }

                var promocionesDto = _mapper.Map<List<PromocionResponseDto>>(promociones);
                return Ok(ApiResponse<List<PromocionResponseDto>>.SuccessResponse(promocionesDto));
            }
            catch (Exception ex)
            {
                // LOGGING A ARCHIVO
                try {
                    var logPath = Path.Combine(Directory.GetCurrentDirectory(), "logs");
                    if (!Directory.Exists(logPath)) Directory.CreateDirectory(logPath);
                    System.IO.File.AppendAllText(Path.Combine(logPath, "promociones_error.txt"), 
                        $"{DateTime.Now}: {ex.Message}\n{ex.StackTrace}\n\n");
                } catch { /* Ignorar error de log */ }

                Console.WriteLine($"Error obteniendo promociones: {ex.Message}");
                return StatusCode(500, ApiResponse.ErrorResponse("Error al obtener promociones: " + ex.Message));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var promocion = await _unitOfWork.Promociones.GetByIdAsync(id);
            if (promocion == null)
            {
                return NotFound(ApiResponse.ErrorResponse($"Promoción con ID {id} no encontrada"));
            }
            var promocionDto = _mapper.Map<PromocionResponseDto>(promocion);
            return Ok(ApiResponse<PromocionResponseDto>.SuccessResponse(promocionDto));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(CreatePromocionRequestDto request)
        {
            var promocion = _mapper.Map<Promocion>(request);
            await _unitOfWork.Promociones.AddAsync(promocion);
            await _unitOfWork.SaveChangesAsync();

            var promocionDto = _mapper.Map<PromocionResponseDto>(promocion);
            return CreatedAtAction(nameof(GetById), new { id = promocion.Id }, 
                ApiResponse<PromocionResponseDto>.SuccessResponse(promocionDto, "Promoción creada exitosamente"));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, UpdatePromocionRequestDto request)
        {
            if (id != request.Id) return BadRequest(ApiResponse.ErrorResponse("ID no coincide"));

            var promocion = await _unitOfWork.Promociones.GetByIdAsync(id);
            if (promocion == null) return NotFound(ApiResponse.ErrorResponse("Promoción no encontrada"));

            _mapper.Map(request, promocion);
            await _unitOfWork.Promociones.UpdateAsync(promocion);
            await _unitOfWork.SaveChangesAsync();

            var promocionDto = _mapper.Map<PromocionResponseDto>(promocion);
            return Ok(ApiResponse<PromocionResponseDto>.SuccessResponse(promocionDto, "Promoción actualizada exitosamente"));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var promocion = await _unitOfWork.Promociones.GetByIdAsync(id);
            if (promocion == null) return NotFound(ApiResponse.ErrorResponse("Promoción no encontrada"));

            await _unitOfWork.Promociones.DeleteAsync(promocion);
            await _unitOfWork.SaveChangesAsync();

            return Ok(ApiResponse.SuccessResponse("Promoción eliminada exitosamente"));
        }
    }
}
