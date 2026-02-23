namespace PastisserieAPI.Core.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        // Repositorios

        Repositories.IUserRepository Users { get; }
        Repositories.IProductoRepository Productos { get; }
        Repositories.IPedidoRepository Pedidos { get; }
        Repositories.ICarritoRepository Carritos { get; }
        Repositories.IEnvioRepository Envios { get; }
        Repositories.IReviewRepository Reviews { get; }
        Repositories.IRepository<Entities.UserRol> UserRoles { get; }
        Repositories.IRepository<Entities.Rol> Roles { get; }
        Repositories.IRepository<Entities.CategoriaProducto> Categorias { get; }
        Repositories.IRepository<Entities.Ingrediente> Ingredientes { get; }
        Repositories.IRepository<Entities.MetodoPagoUsuario> MetodosPagoUsuario { get; }
        Repositories.IRepository<Entities.TipoMetodoPago> TiposMetodoPago { get; }
        Repositories.IRepository<Entities.Notificacion> Notificaciones { get; }
        Repositories.IRepository<Entities.Promocion> Promociones { get; }
        Repositories.IRepository<Entities.ConfiguracionTienda> Configuracion { get; }

        // Métodos
        Task<int> SaveChangesAsync();
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}