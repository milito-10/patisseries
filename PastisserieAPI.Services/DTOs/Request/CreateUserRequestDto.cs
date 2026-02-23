using System.ComponentModel.DataAnnotations;

namespace PastisserieAPI.Services.DTOs.Request
{
    public class CreateUserRequestDto : RegisterRequestDto
    {
        [Required]
        public string Rol { get; set; } = "Usuario";
    }
}
