using PastisserieAPI.Services.DTOs.Response;

namespace PastisserieAPI.Services.Services.Interfaces
{
    public interface INotificacionService
    {
        Task<List<NotificacionResponseDto>> GetByUsuarioIdAsync(int usuarioId);
        Task<bool> MarcarComoLeidaAsync(int notificacionId, int usuarioId);
        Task<bool> MarcarTodasComoLeidasAsync(int usuarioId);
        Task CrearNotificacionAsync(int usuarioId, string titulo, string mensaje, string tipo = "Info");
    }
}
