using Microsoft.EntityFrameworkCore;
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Core.Interfaces.Repositories;
using PastisserieAPI.Infrastructure.Data;

namespace PastisserieAPI.Infrastructure.Repositories
{
    public class CarritoRepository : Repository<CarritoCompra>, ICarritoRepository
    {
        public CarritoRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<CarritoCompra?> GetByUsuarioIdAsync(int usuarioId)
        {
            return await _dbSet
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UsuarioId == usuarioId);
        }

        // 👇 ESTE ES EL MÉTODO CLAVE PARA PEDIDOS
        public async Task<CarritoCompra?> GetByUsuarioIdWithItemsAsync(int usuarioId)
        {
            return await _dbSet
                .Include(c => c.Items)
                .ThenInclude(i => i.Producto) // Importante: Traer el producto para ver stock y precio
                .FirstOrDefaultAsync(c => c.UsuarioId == usuarioId);
        }

        public async Task ClearCarritoAsync(int carritoId)
        {
            var carrito = await _dbSet
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.Id == carritoId);

            if (carrito != null)
            {
                _context.Set<CarritoItem>().RemoveRange(carrito.Items);
                await _context.SaveChangesAsync();
            }
        }
    }
}