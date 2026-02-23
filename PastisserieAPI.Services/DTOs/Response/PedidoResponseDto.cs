namespace PastisserieAPI.Services.DTOs.Response
{
    public class PedidoResponseDto
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }

        // Mantenemos este campo plano por compatibilidad
        public string NombreUsuario { get; set; } = string.Empty;

        // ✅ PROPIEDAD CLAVE: Objeto con los datos del cliente para el Dashboard
        public UsuarioResumenDto? Usuario { get; set; }

        public DateTime FechaPedido { get; set; }
        public string Estado { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public decimal IVA { get; set; }
        public decimal CostoEnvio { get; set; }
        public decimal Total { get; set; }
        public bool EsPersonalizado { get; set; }
        public bool Aprobado { get; set; }
        public DateTime? FechaEntregaEstimada { get; set; }

        public List<PedidoItemResponseDto> Items { get; set; } = new();
        public DireccionEnvioResponseDto? DireccionEnvio { get; set; }
    }

    public class PedidoItemResponseDto
    {
        public int Id { get; set; }
        public int ProductoId { get; set; }
        public string NombreProducto { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Subtotal { get; set; }
    }

    // ✅ DTO para el resumen del usuario
    public class UsuarioResumenDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}