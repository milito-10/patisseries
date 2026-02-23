using System;
using System.ComponentModel.DataAnnotations;

namespace PastisserieAPI.Core.Entities
{
    public class ConfiguracionTienda
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string NombreTienda { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Direccion { get; set; } = string.Empty;

        [MaxLength(20)]
        public string Telefono { get; set; } = string.Empty;

        [MaxLength(100)]
        public string EmailContacto { get; set; } = string.Empty;

        public decimal CostoEnvio { get; set; }

        [MaxLength(50)]
        public string Moneda { get; set; } = "COP";

        [MaxLength(500)]
        public string MensajeBienvenida { get; set; } = string.Empty;

        public DateTime FechaActualizacion { get; set; } = DateTime.UtcNow;
    }
}
