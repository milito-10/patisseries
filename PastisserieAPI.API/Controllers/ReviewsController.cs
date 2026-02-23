using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PastisserieAPI.Services.DTOs.Request;
using PastisserieAPI.Services.DTOs.Response;
using PastisserieAPI.Services.DTOs.Common;
using PastisserieAPI.Services.Services.Interfaces;
using System.Security.Claims;

namespace PastisserieAPI.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpGet("producto/{productId}")]
        public async Task<IActionResult> GetByProduct(int productId)
        {
            var result = await _reviewService.GetByProductIdAsync(productId);
            return Ok(ApiResponse<List<ReviewResponseDto>>.SuccessResponse(result));
        }

        [HttpGet]
        public async Task<IActionResult> GetFeatured()
        {
            var result = await _reviewService.GetFeaturedAsync();
            return Ok(ApiResponse<List<ReviewResponseDto>>.SuccessResponse(result));
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateReviewRequestDto request)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized(ApiResponse<string>.ErrorResponse("Usuario no identificado"));

            var result = await _reviewService.CreateAsync(userId, request);
            return Ok(ApiResponse<ReviewResponseDto>.SuccessResponse(result, "Reseña creada"));
        }
    }
}