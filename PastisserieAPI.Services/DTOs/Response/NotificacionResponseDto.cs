namespace PastisserieAPI.Services.DTOs.Response
{
    public class NotificacionResponseDto
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Mensaje { get; set; } = string.Empty;
        public bool Leida { get; set; }
        public string Tipo { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; }
    }
}
