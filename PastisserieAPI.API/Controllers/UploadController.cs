using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PastisserieAPI.Services.DTOs.Common;

namespace PastisserieAPI.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Solo usuarios autenticados pueden subir archivos
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<UploadController> _logger;

        public UploadController(IWebHostEnvironment environment, ILogger<UploadController> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(ApiResponse.ErrorResponse("No se ha seleccionado ningún archivo."));
            }

            try
            {
                // Validar extensión
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest(ApiResponse.ErrorResponse("Tipo de archivo no permitido. Solo se permiten imágenes."));
                }

                // Crear directorio si no existe (wwwroot/images/products)
                // Usamos _environment.WebRootPath que apunta a wwwroot
                var webRoot = _environment.WebRootPath;
                if (string.IsNullOrEmpty(webRoot))
                {
                    // Fallback si WebRootPath es nulo (puede pasar en algunas configs)
                    webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                }

                var uploadsFolder = Path.Combine(webRoot, "images", "products");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Generar nombre único
                var uniqueFileName = Guid.NewGuid().ToString() + extension;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Guardar archivo
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Retornar URL relativa para que sea accesible desde el navegador
                var fileUrl = $"/images/products/{uniqueFileName}";
                
                // NOTA: No devolvemos la URL completa con dominio para evitar problemas de CORS/Proxy
                // El frontend ya sabe concatenar la URL base si es necesario, o el navegador lo resuelve.
                
                return Ok(ApiResponse<object>.SuccessResponse(new { url = fileUrl }, "Imagen subida exitosamente"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al subir archivo");
                return StatusCode(500, ApiResponse.ErrorResponse("Error interno al subir la imagen: " + ex.Message));
            }
        }
    }
}
