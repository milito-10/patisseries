using System;

namespace PastisserieAPI.Services.DTOs.Response
{
    public class PromocionResponseDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string TipoDescuento { get; set; } = "Porcentaje";
        public decimal Valor { get; set; }
        public string? CodigoPromocional { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public bool Activo { get; set; }
        public string? ImagenUrl { get; set; }
    }
}
