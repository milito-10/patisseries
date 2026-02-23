namespace PastisserieAPI.Services.DTOs.Request
{
    public class CreatePedidoRequestDto
    {
        public int UsuarioId { get; set; }
        public int MetodoPagoId { get; set; }
        public string? MetodoPago { get; set; } // Simulación: "Tarjeta", "Efectivo"
        public int? DireccionEnvioId { get; set; }
        public string? Direccion { get; set; } // Simulación: Address text
        public string? NotasCliente { get; set; }
        public List<PedidoItemRequestDto> Items { get; set; } = new();
        public PersonalizadoConfigRequestDto? PersonalizadoConfig { get; set; }
    }

    public class PedidoItemRequestDto
    {
        public int ProductoId { get; set; }
        public int Cantidad { get; set; }
    }

    public class PersonalizadoConfigRequestDto
    {
        public string? Sabor { get; set; }
        public string? Tamano { get; set; }
        public string? Forma { get; set; }
        public string? Color { get; set; }
        public int Niveles { get; set; } = 1;
        public string? Diseno { get; set; }
        public string? ImagenReferenciaUrl { get; set; }
        public string? InstruccionesEspeciales { get; set; }
        public List<int> IngredientesIds { get; set; } = new();
    }
}