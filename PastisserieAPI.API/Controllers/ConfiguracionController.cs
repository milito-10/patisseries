using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Services.DTOs.Common;

namespace PastisserieAPI.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConfiguracionController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public ConfiguracionController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetConfig()
        {
            var configs = await _unitOfWork.Configuracion.GetAllAsync();
            var config = configs.FirstOrDefault();
            return Ok(ApiResponse<ConfiguracionTienda>.SuccessResponse(config!, config == null ? "No se encontró configuración" : "Configuración cargada"));
        }

        [Authorize(Roles = "Admin")]
        [HttpPut]
        public async Task<IActionResult> UpdateConfig([FromBody] ConfiguracionTienda newConfig)
        {
            var configs = await _unitOfWork.Configuracion.GetAllAsync();
            var existingConfig = configs.FirstOrDefault();
            
            if (existingConfig == null)
            {
                await _unitOfWork.Configuracion.AddAsync(newConfig);
            }
            else
            {
                existingConfig.NombreTienda = newConfig.NombreTienda;
                existingConfig.Direccion = newConfig.Direccion;
                existingConfig.Telefono = newConfig.Telefono;
                existingConfig.EmailContacto = newConfig.EmailContacto;
                existingConfig.CostoEnvio = newConfig.CostoEnvio;
                existingConfig.Moneda = newConfig.Moneda;
                existingConfig.MensajeBienvenida = newConfig.MensajeBienvenida;
                existingConfig.FechaActualizacion = DateTime.UtcNow;
                await _unitOfWork.Configuracion.UpdateAsync(existingConfig);
            }

            await _unitOfWork.SaveChangesAsync();
            return Ok(ApiResponse<ConfiguracionTienda>.SuccessResponse(existingConfig ?? newConfig, "Configuración actualizada"));
        }
    }
}
