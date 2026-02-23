using Microsoft.EntityFrameworkCore;
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Core.Interfaces.Repositories;
using PastisserieAPI.Infrastructure.Data;

namespace PastisserieAPI.Infrastructure.Repositories
{
    public class ReviewRepository : Repository<Review>, IReviewRepository
    {
        public ReviewRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Review>> GetByProductoIdAsync(int productoId)
        {
            return await _dbSet
                .Include(r => r.Usuario)
                .Where(r => r.ProductoId == productoId && r.Aprobada) // Solo aprobadas
                .OrderByDescending(r => r.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<Review>> GetByUsuarioIdAsync(int usuarioId)
        {
            return await _dbSet
                .Include(r => r.Producto)
                .Where(r => r.UsuarioId == usuarioId)
                .OrderByDescending(r => r.Fecha)
                .ToListAsync();
        }

        public async Task<double> GetPromedioCalificacionAsync(int productoId)
        {
            var reviews = await _dbSet
                .Where(r => r.ProductoId == productoId && r.Aprobada)
                .ToListAsync();

            if (!reviews.Any())
                return 0;

            return reviews.Average(r => r.Calificacion);
        }

        public async Task<IEnumerable<Review>> GetReviewsPendientesAprobacionAsync()
        {
            return await _dbSet
                .Include(r => r.Usuario)
                .Include(r => r.Producto)
                .Where(r => !r.Aprobada)
                .OrderBy(r => r.Fecha)
                .ToListAsync();
        }

        // 👇 IMPLEMENTACIÓN NUEVA
        public async Task<IEnumerable<Review>> GetFeaturedAsync()
        {
            return await _dbSet
                .Include(r => r.Usuario)
                .Where(r => r.Calificacion == 5 && r.Aprobada) // 5 Estrellas y aprobadas
                .OrderByDescending(r => r.Fecha)
                .Take(3)
                .ToListAsync();
        }
    }
}