using Microsoft.EntityFrameworkCore;
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Core.Interfaces.Repositories;
using PastisserieAPI.Infrastructure.Data;

namespace PastisserieAPI.Infrastructure.Repositories
{
    public class EnvioRepository : Repository<Envio>, IEnvioRepository
    {
        public EnvioRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Envio>> GetByRepartidorIdAsync(int repartidorId)
        {
            return await _dbSet
                .Include(e => e.Pedido)
                    .ThenInclude(p => p.Usuario)
                .Include(e => e.Pedido)
                    .ThenInclude(p => p.DireccionEnvio)
                .Where(e => e.RepartidorId == repartidorId)
                .OrderByDescending(e => e.FechaDespacho)
                .ToListAsync();
        }

        public async Task<IEnumerable<Envio>> GetEnviosPendientesAsync()
        {
            return await _dbSet
                .Include(e => e.Pedido)
                .Where(e => e.Estado == "Pendiente")
                .ToListAsync();
        }

        public async Task<Envio?> GetByPedidoIdAsync(int pedidoId)
        {
            return await _dbSet
                .Include(e => e.Repartidor)
                .FirstOrDefaultAsync(e => e.PedidoId == pedidoId);
        }
    }
}