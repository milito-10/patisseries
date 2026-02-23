using PastisserieAPI.Core.Entities;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Core.Interfaces.Repositories;
using PastisserieAPI.Infrastructure.Data;

namespace PastisserieAPI.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;

        // Propiedades de los Repositorios Específicos
        public IUserRepository Users { get; private set; }
        public IProductoRepository Productos { get; private set; }
        public IPedidoRepository Pedidos { get; private set; }
        public ICarritoRepository Carritos { get; private set; }
        public IReviewRepository Reviews { get; private set; }

        // 👇 AGREGADO: Repositorio de Envíos que faltaba
        public IEnvioRepository Envios { get; private set; }

        // Repositorios Genéricos
        public IRepository<UserRol> UserRoles { get; private set; }
        public IRepository<Rol> Roles { get; private set; }
        public IRepository<CategoriaProducto> Categorias { get; private set; }
        public IRepository<Ingrediente> Ingredientes { get; private set; }
        public IRepository<TipoMetodoPago> TiposMetodoPago { get; private set; }
        public IRepository<MetodoPagoUsuario> MetodosPagoUsuario { get; private set; }

        // 👇 AGREGADO: Repositorio de Notificaciones que faltaba
        public IRepository<Notificacion> Notificaciones { get; private set; }
        public IRepository<Promocion> Promociones { get; private set; }
        public IRepository<ConfiguracionTienda> Configuracion { get; private set; }

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;

            // Inicializamos Específicos
            Users = new UserRepository(_context);
            Productos = new ProductoRepository(_context);
            Pedidos = new PedidoRepository(_context);
            Carritos = new CarritoRepository(_context);
            Reviews = new ReviewRepository(_context);

            // 👇 INICIALIZAMOS ENVÍOS
            // Nota: Asumo que tienes la clase EnvioRepository. Si te da error aquí, avísame.
            Envios = new EnvioRepository(_context);

            // Inicializamos Genéricos
            UserRoles = new Repository<UserRol>(_context);
            Roles = new Repository<Rol>(_context);
            Categorias = new Repository<CategoriaProducto>(_context);
            Ingredientes = new Repository<Ingrediente>(_context);
            TiposMetodoPago = new Repository<TipoMetodoPago>(_context);
            MetodosPagoUsuario = new Repository<MetodoPagoUsuario>(_context);

            // 👇 INICIALIZAMOS NOTIFICACIONES
            Notificaciones = new Repository<Notificacion>(_context);
            Promociones = new Repository<Promocion>(_context);
            Configuracion = new Repository<ConfiguracionTienda>(_context);
        }

        public IRepository<T> Repository<T>() where T : class
        {
            return new Repository<T>(_context);
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        public Task BeginTransactionAsync() => Task.CompletedTask;
        public Task CommitTransactionAsync() => Task.CompletedTask;
        public Task RollbackTransactionAsync() => Task.CompletedTask;
    }
}