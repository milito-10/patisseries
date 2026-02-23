using System;

namespace PastisserieAPI.Services.DTOs.Request
{
    public class CreatePromocionRequestDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string TipoDescuento { get; set; } = "Porcentaje";
        public decimal Valor { get; set; }
        public string? CodigoPromocional { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public bool Activo { get; set; } = true;
        public string? ImagenUrl { get; set; }
    }

    public class UpdatePromocionRequestDto : CreatePromocionRequestDto
    {
        public int Id { get; set; }
    }
}
