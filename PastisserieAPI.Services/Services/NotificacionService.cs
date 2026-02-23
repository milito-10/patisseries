using AutoMapper;
using Microsoft.EntityFrameworkCore;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Services.DTOs.Response;
using PastisserieAPI.Services.Services.Interfaces;

namespace PastisserieAPI.Services.Services
{
    public class NotificacionService : INotificacionService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public NotificacionService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<List<NotificacionResponseDto>> GetByUsuarioIdAsync(int usuarioId)
        {
            var notificaciones = await _unitOfWork.Notificaciones.FindAsync(n => n.UsuarioId == usuarioId);
            
            var orderedNotificaciones = notificaciones.OrderByDescending(n => n.FechaCreacion).ToList();

            return _mapper.Map<List<NotificacionResponseDto>>(orderedNotificaciones);
        }

        public async Task<bool> MarcarComoLeidaAsync(int notificacionId, int usuarioId)
        {
            var notificacion = await _unitOfWork.Notificaciones.GetByIdAsync(notificacionId);
            
            if (notificacion == null || notificacion.UsuarioId != usuarioId)
                return false;

            notificacion.Leida = true;
            await _unitOfWork.Notificaciones.UpdateAsync(notificacion);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MarcarTodasComoLeidasAsync(int usuarioId)
        {
            var notificaciones = await _unitOfWork.Notificaciones
                .FindAsync(n => n.UsuarioId == usuarioId && !n.Leida);

            if (!notificaciones.Any()) return false;

            foreach (var notificacion in notificaciones)
            {
                notificacion.Leida = true;
                await _unitOfWork.Notificaciones.UpdateAsync(notificacion);
            }

            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task CrearNotificacionAsync(int usuarioId, string titulo, string mensaje, string tipo = "Info")
        {
            var notificacion = new Notificacion
            {
                UsuarioId = usuarioId,
                Titulo = titulo,
                Mensaje = mensaje,
                Tipo = tipo,
                Leida = false,
                FechaCreacion = DateTime.UtcNow
            };

            await _unitOfWork.Notificaciones.AddAsync(notificacion);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
