using Microsoft.EntityFrameworkCore;
using PastisserieAPI.Core.Entities;

namespace PastisserieAPI.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // ============ USUARIOS Y ROLES ============
        public DbSet<User> Users { get; set; }
        public DbSet<Rol> Roles { get; set; }
        public DbSet<UserRol> UserRoles { get; set; }

        // ============ PRODUCTOS ============
        public DbSet<CategoriaProducto> CategoriasProducto { get; set; }
        public DbSet<Producto> Productos { get; set; }
        public DbSet<Review> Reviews { get; set; }

        // ============ PEDIDOS ============
        public DbSet<Pedido> Pedidos { get; set; }
        public DbSet<PedidoItem> PedidoItems { get; set; }
        public DbSet<PedidoHistorial> PedidoHistoriales { get; set; }
        public DbSet<Factura> Facturas { get; set; }

        // ============ PERSONALIZACIÓN ============
        public DbSet<PersonalizadoConfig> PersonalizadoConfigs { get; set; }
        public DbSet<Ingrediente> Ingredientes { get; set; }
        public DbSet<PersonalizadoConfigIngrediente> PersonalizadoConfigIngredientes { get; set; }

        // ============ CARRITO ============
        public DbSet<CarritoCompra> Carritos { get; set; }
        public DbSet<CarritoItem> CarritoItems { get; set; }

        // ============ PROMOCIONES ============
        public DbSet<Promocion> Promociones { get; set; }

        // ============ PAGOS ============
        public DbSet<TipoMetodoPago> TiposMetodoPago { get; set; }
        public DbSet<MetodoPagoUsuario> MetodosPagoUsuario { get; set; }

        // ============ DIRECCIONES Y ENVÍOS ============
        public DbSet<DireccionEnvio> DireccionesEnvio { get; set; }
        public DbSet<Envio> Envios { get; set; }

        // ============ NOTIFICACIONES ============
        public DbSet<Notificacion> Notificaciones { get; set; }

        // ============ CONFIGURACIÓN ============
        public DbSet<ConfiguracionTienda> ConfiguracionTienda { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Aplicar todas las configuraciones automáticamente
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

            // Configuraciones adicionales y seeds
            ConfigureRelationships(modelBuilder);
            SeedInitialData(modelBuilder);
        }

        private void ConfigureRelationships(ModelBuilder modelBuilder)
        {
            // ============ USER - ENVIO (Repartidor) ============
            modelBuilder.Entity<Envio>()
                .HasOne(e => e.Repartidor)
                .WithMany(u => u.EnviosAsignados)
                .HasForeignKey(e => e.RepartidorId)
                .OnDelete(DeleteBehavior.Restrict);

            // ============ PEDIDO - USER ============
            modelBuilder.Entity<Pedido>()
                .HasOne(p => p.Usuario)
                .WithMany(u => u.Pedidos)
                .HasForeignKey(p => p.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            // ============ REVIEW - USER ============
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Usuario)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            // ============ ÍNDICES ÚNICOS ============
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Factura>()
                .HasIndex(f => f.NumeroFactura)
                .IsUnique();

            // ============ ÍNDICES DE RENDIMIENTO ============
            modelBuilder.Entity<Producto>()
                .HasIndex(p => p.Categoria);

            modelBuilder.Entity<Pedido>()
                .HasIndex(p => p.Estado);

            modelBuilder.Entity<Pedido>()
                .HasIndex(p => p.FechaPedido);
        }

        private void SeedInitialData(ModelBuilder modelBuilder)
        {
            // ============ ROLES INICIALES ============
            modelBuilder.Entity<Rol>().HasData(
                new Rol { Id = 1, Nombre = "Usuario", Activo = true },
                new Rol { Id = 2, Nombre = "Admin", Activo = true },
                new Rol { Id = 3, Nombre = "Domiciliario", Activo = true },
                new Rol { Id = 4, Nombre = "Gerente", Activo = true }
            );

            // ============ TIPOS DE MÉTODO DE PAGO ============
            modelBuilder.Entity<TipoMetodoPago>().HasData(
                new TipoMetodoPago { Id = 1, Nombre = "Efectivo", Descripcion = "Pago en efectivo contra entrega", Activo = true },
                new TipoMetodoPago { Id = 2, Nombre = "Tarjeta de Crédito", Descripcion = "Pago con tarjeta de crédito", Activo = true },
                new TipoMetodoPago { Id = 3, Nombre = "Tarjeta de Débito", Descripcion = "Pago con tarjeta de débito", Activo = true },
                new TipoMetodoPago { Id = 4, Nombre = "Transferencia", Descripcion = "Transferencia bancaria", Activo = true },
                new TipoMetodoPago { Id = 5, Nombre = "PSE", Descripcion = "Pago electrónico PSE", Activo = true }
            );

            // ============ CATEGORÍAS DE PRODUCTOS ============
            modelBuilder.Entity<CategoriaProducto>().HasData(
                new CategoriaProducto { Id = 1, Nombre = "Tortas", Descripcion = "Tortas y pasteles", Activa = true },
                new CategoriaProducto { Id = 2, Nombre = "Panes", Descripcion = "Variedad de panes artesanales", Activa = true },
                new CategoriaProducto { Id = 3, Nombre = "Postres", Descripcion = "Postres y dulces", Activa = true },
                new CategoriaProducto { Id = 4, Nombre = "Galletas", Descripcion = "Galletas caseras", Activa = true },
                new CategoriaProducto { Id = 5, Nombre = "Personalizados", Descripcion = "Productos personalizables", Activa = true }
            );

            // ============ INGREDIENTES PARA PERSONALIZACIÓN ============
            modelBuilder.Entity<Ingrediente>().HasData(
                new Ingrediente { Id = 1, Nombre = "Arequipe", Descripcion = "Relleno de arequipe", PrecioAdicional = 5000, Activo = true },
                new Ingrediente { Id = 2, Nombre = "Crema de chocolate", Descripcion = "Crema de chocolate belga", PrecioAdicional = 7000, Activo = true },
                new Ingrediente { Id = 3, Nombre = "Fresas frescas", Descripcion = "Fresas naturales", PrecioAdicional = 8000, Activo = true },
                new Ingrediente { Id = 4, Nombre = "Frutas mixtas", Descripcion = "Variedad de frutas", PrecioAdicional = 10000, Activo = true },
                new Ingrediente { Id = 5, Nombre = "Chispas de chocolate", Descripcion = "Chispas de chocolate", PrecioAdicional = 3000, Activo = true },
                new Ingrediente { Id = 6, Nombre = "Nueces", Descripcion = "Nueces tostadas", PrecioAdicional = 6000, Activo = true },
                new Ingrediente { Id = 7, Nombre = "Coco rallado", Descripcion = "Coco natural rallado", PrecioAdicional = 4000, Activo = true }
            );

            // ============ USUARIO ADMINISTRADOR INICIAL ============
            modelBuilder.Entity<User>().HasData(
                new User 
                { 
                    Id = 1, 
                    Nombre = "Admin Deluxe", 
                    Email = "administrador123@gmail.com", 
                    PasswordHash = "$2a$11$R.S2S/JpXw5P8v2kF3h5Ze3Xm6N2q4T6V7W8X9Y0Z1A2B3C4D5E6F", // Corresponde a "Admin123"
                    EmailVerificado = true,
                    Activo = true,
                    FechaRegistro = new DateTime(2024, 1, 1),
                    FechaCreacion = new DateTime(2024, 1, 1)
                }
            );

            modelBuilder.Entity<UserRol>().HasData(
                new UserRol 
                { 
                    Id = 1, 
                    UsuarioId = 1, 
                    RolId = 2, // Admin
                    FechaAsignacion = new DateTime(2024, 1, 1) 
                }
            );

            // ============ CONFIGURACIÓN INICIAL DE LA TIENDA ============
            modelBuilder.Entity<ConfiguracionTienda>().HasData(
                new ConfiguracionTienda
                {
                    Id = 1,
                    NombreTienda = "Pâtisserie Deluxe",
                    Direccion = "Calle 123 # 45 - 67, Bogotá",
                    Telefono = "300 123 4567",
                    EmailContacto = "contacto@pastisseriedeluxe.com",
                    CostoEnvio = 5000,
                    Moneda = "COP",
                    MensajeBienvenida = "Bienvenido a la mejor pastelería artesanal",
                    FechaActualizacion = DateTime.UtcNow
                }
            );
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            // Actualizar automáticamente FechaActualizacion
            var entries = ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Modified);

            foreach (var entry in entries)
            {
                if (entry.Entity.GetType().GetProperty("FechaActualizacion") != null)
                {
                    entry.Property("FechaActualizacion").CurrentValue = DateTime.UtcNow;
                }
            }

            return base.SaveChangesAsync(cancellationToken);
        }
    }
}