using Microsoft.AspNetCore.Mvc;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Services.DTOs.Request;
using PastisserieAPI.Services.DTOs.Response;
using PastisserieAPI.Services.DTOs.Common;
using AutoMapper;
using PastisserieAPI.Core.Entities;

namespace PastisserieAPI.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductosController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<ProductosController> _logger;

        public ProductosController(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ILogger<ProductosController> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todos los productos
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var productos = await _unitOfWork.Productos.GetAllAsync();
            var productosDto = _mapper.Map<List<ProductoResponseDto>>(productos);

            return Ok(ApiResponse<List<ProductoResponseDto>>.SuccessResponse(
                productosDto,
                $"Se encontraron {productosDto.Count} productos"
            ));
        }

        /// <summary>
        /// Obtener producto por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var producto = await _unitOfWork.Productos.GetByIdWithReviewsAsync(id);

            if (producto == null)
            {
                return NotFound(ApiResponse<ProductoResponseDto>.ErrorResponse(
                    $"Producto con ID {id} no encontrado"
                ));
            }

            var productoDto = _mapper.Map<ProductoResponseDto>(producto);
            return Ok(ApiResponse<ProductoResponseDto>.SuccessResponse(productoDto));
        }

        /// <summary>
        /// Crear nuevo producto
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProductoRequestDto request)
        {
            var producto = _mapper.Map<Producto>(request);
            await _unitOfWork.Productos.AddAsync(producto);
            await _unitOfWork.SaveChangesAsync();

            var productoDto = _mapper.Map<ProductoResponseDto>(producto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = producto.Id },
                ApiResponse<ProductoResponseDto>.SuccessResponse(
                    productoDto,
                    "Producto creado exitosamente"
                )
            );
        }

        /// <summary>
        /// Actualizar producto
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProductoRequestDto request)
        {
            var producto = await _unitOfWork.Productos.GetByIdAsync(id);

            if (producto == null)
            {
                return NotFound(ApiResponse<ProductoResponseDto>.ErrorResponse(
                    $"Producto con ID {id} no encontrado"
                ));
            }

            _mapper.Map(request, producto);
            await _unitOfWork.Productos.UpdateAsync(producto);
            await _unitOfWork.SaveChangesAsync();

            var productoDto = _mapper.Map<ProductoResponseDto>(producto);

            return Ok(ApiResponse<ProductoResponseDto>.SuccessResponse(
                productoDto,
                "Producto actualizado exitosamente"
            ));
        }

        /// <summary>
        /// Eliminar producto
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var producto = await _unitOfWork.Productos.GetByIdAsync(id);

            if (producto == null)
            {
                return NotFound(ApiResponse.ErrorResponse(
                    $"Producto con ID {id} no encontrado"
                ));
            }

            await _unitOfWork.Productos.DeleteAsync(producto);
            await _unitOfWork.SaveChangesAsync();

            return Ok(ApiResponse.SuccessResponse("Producto eliminado exitosamente"));
        }

        /// <summary>
        /// Obtener productos activos
        /// </summary>
        [HttpGet("activos")]
        public async Task<IActionResult> GetActivos()
        {
            var productos = await _unitOfWork.Productos.GetProductosActivosAsync();
            var productosDto = _mapper.Map<List<ProductoResponseDto>>(productos);

            return Ok(ApiResponse<List<ProductoResponseDto>>.SuccessResponse(
                productosDto,
                $"Se encontraron {productosDto.Count} productos activos"
            ));
        }
    }
}