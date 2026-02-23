using Microsoft.AspNetCore.Mvc;
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Core.Interfaces;

namespace PastisserieAPI.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriasController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public CategoriasController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categorias = await _unitOfWork.Categorias.GetAllAsync();
            return Ok(new { success = true, data = categorias });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CategoriaProducto categoria)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            categoria.Activa = true; // Por defecto
            await _unitOfWork.Categorias.AddAsync(categoria);
            await _unitOfWork.SaveChangesAsync();

            return Ok(new { success = true, data = categoria });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CategoriaProducto categoria)
        {
            if (id != categoria.Id) return BadRequest("ID mismatch");

            var existing = await _unitOfWork.Categorias.GetByIdAsync(id);
            if (existing == null) return NotFound();

            existing.Nombre = categoria.Nombre;
            existing.Descripcion = categoria.Descripcion;
            // existing.Activa = categoria.Activa; // Opcional

            await _unitOfWork.Categorias.UpdateAsync(existing);
            await _unitOfWork.SaveChangesAsync();

            return Ok(new { success = true, data = existing });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _unitOfWork.Categorias.GetByIdAsync(id);
            if (existing == null) return NotFound();

            await _unitOfWork.Categorias.DeleteAsync(existing);
            await _unitOfWork.SaveChangesAsync();

            return Ok(new { success = true, message = "Categoría eliminada" });
        }
    }
}
