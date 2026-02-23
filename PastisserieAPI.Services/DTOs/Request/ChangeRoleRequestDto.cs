using System.ComponentModel.DataAnnotations;

namespace PastisserieAPI.Services.DTOs.Request
{
    public class ChangeRoleRequestDto
    {
        [Required]
        public string NuevoRol { get; set; } = string.Empty;
    }
}
