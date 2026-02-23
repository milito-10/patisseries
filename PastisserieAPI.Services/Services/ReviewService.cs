using AutoMapper;
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Services.DTOs.Request;
using PastisserieAPI.Services.DTOs.Response;
using PastisserieAPI.Services.Services.Interfaces;

namespace PastisserieAPI.Services.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ReviewService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<List<ReviewResponseDto>> GetByProductIdAsync(int productId)
        {
            // CORRECCIÓN: Usamos el método específico del repositorio (GetByProductoIdAsync)
            // en lugar del genérico GetAsync que daba error.
            var reviews = await _unitOfWork.Reviews.GetByProductoIdAsync(productId);

            return _mapper.Map<List<ReviewResponseDto>>(reviews);
        }

        public async Task<List<ReviewResponseDto>> GetFeaturedAsync()
        {
            // CORRECCIÓN: Usamos el método específico para destacadas
            var reviews = await _unitOfWork.Reviews.GetFeaturedAsync();

            return _mapper.Map<List<ReviewResponseDto>>(reviews);
        }

        public async Task<ReviewResponseDto> CreateAsync(int userId, CreateReviewRequestDto request)
        {
            var review = _mapper.Map<Review>(request);
            review.UsuarioId = userId;
            review.Fecha = DateTime.UtcNow;

            // AddAsync suele ser estándar en el repositorio base. 
            // Si te da error aquí, avísame, pero debería funcionar.
            await _unitOfWork.Reviews.AddAsync(review);
            await _unitOfWork.SaveChangesAsync();

            // Retornamos el DTO mapeado directamente
            return _mapper.Map<ReviewResponseDto>(review);
        }
    }
}