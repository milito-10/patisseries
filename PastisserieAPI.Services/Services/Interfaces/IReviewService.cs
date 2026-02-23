using PastisserieAPI.Services.DTOs.Request;
using PastisserieAPI.Services.DTOs.Response;

namespace PastisserieAPI.Services.Services.Interfaces
{
    public interface IReviewService
    {
        Task<List<ReviewResponseDto>> GetByProductIdAsync(int productId);
        Task<List<ReviewResponseDto>> GetFeaturedAsync(); // Para el Home
        Task<ReviewResponseDto> CreateAsync(int userId, CreateReviewRequestDto request);
    }
}