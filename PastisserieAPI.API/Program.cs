using Microsoft.EntityFrameworkCore;
using PastisserieAPI.Infrastructure.Data;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Core.Interfaces.Repositories;
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Infrastructure.Repositories;
using FluentValidation;
using System.Reflection;
using PastisserieAPI.Services.Helpers;
using PastisserieAPI.Services.Services.Interfaces;
using PastisserieAPI.Services.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using PastisserieAPI.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// ============ CONFIGURACIÓN DE SERVICIOS ============

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddScoped<IReviewService, ReviewService>();

// Configurar DbContext con SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null
        )
    )
);

// Inyección de dependencias - Unit of Work Pattern
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Inyección de dependencias - Repositorios (opcional, si quieres usarlos directamente)
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProductoRepository, ProductoRepository>();
builder.Services.AddScoped<IPedidoRepository, PedidoRepository>();
builder.Services.AddScoped<ICarritoRepository, CarritoRepository>();
builder.Services.AddScoped<IEnvioRepository, EnvioRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();

// AutoMapper - Cargar desde el ensamblado de Services donde está MappingProfile
builder.Services.AddAutoMapper(typeof(PastisserieAPI.Services.Mappings.MappingProfile));

// FluentValidation
builder.Services.AddValidatorsFromAssembly(Assembly.Load("PastisserieAPI.Services"));

// JWT Helper
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
builder.Services.AddSingleton(new JwtHelper(
    jwtSettings["SecretKey"]!,
    jwtSettings["Issuer"]!,
    jwtSettings["Audience"]!,
    int.Parse(jwtSettings["ExpirationMinutes"]!)
));

// Servicios de negocio
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProductoService, ProductoService>();
builder.Services.AddScoped<IPedidoService, PedidoService>();
builder.Services.AddScoped<ICarritoService, CarritoService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<INotificacionService, NotificacionService>();

// Autenticación JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!)
        ),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:7108", "http://localhost:5174") 
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Swagger - COMENTADO TEMPORALMENTE
// builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen();

// Swagger con JWT
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Pastisserie API",
        Version = "v1",
        Description = "API para gestión de panadería y pastelería"
    });

    // Configuración de seguridad JWT
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "Ingrese el token JWT en el formato: Bearer {token}",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ============ CONFIGURACIÓN DEL PIPELINE HTTP ============

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Pastisserie API V1");
    });
}

// ============ AUTO-REPARACIÓN DE DB ============
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        // Ejecutar script de reparación si es necesario
        // Script SQL embedded para máxima fiabilidad
        var sql = @"
-- 1. Tabla Promociones
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Promociones' AND xtype='U')
BEGIN
    CREATE TABLE [Promociones] (
        [Id] int NOT NULL IDENTITY,
        [Nombre] nvarchar(max) NOT NULL,
        [Descripcion] nvarchar(max) NULL,
        [TipoDescuento] nvarchar(max) NOT NULL,
        [Valor] decimal(18,2) NOT NULL,
        [CodigoPromocional] nvarchar(max) NULL,
        [FechaInicio] datetime2 NOT NULL,
        [FechaFin] datetime2 NOT NULL,
        [Activo] bit NOT NULL,
        [ImagenUrl] nvarchar(max) NULL,
        [FechaCreacion] datetime2 NOT NULL DEFAULT GETDATE(),
        [FechaActualizacion] datetime2 NULL,
        CONSTRAINT [PK_Promociones] PRIMARY KEY ([Id])
    );
END;

-- 2. Tabla Carritos
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Carritos' AND xtype='U')
BEGIN
    CREATE TABLE [Carritos] (
        [Id] int NOT NULL IDENTITY,
        [UsuarioId] int NOT NULL,
        [FechaCreacion] datetime2 NOT NULL,
        [FechaActualizacion] datetime2 NULL,
        CONSTRAINT [PK_Carritos] PRIMARY KEY ([Id])
    );
END;

-- 3. Tabla CarritoItems
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CarritoItems' AND xtype='U')
BEGIN
    CREATE TABLE [CarritoItems] (
        [Id] int NOT NULL IDENTITY,
        [CarritoId] int NOT NULL,
        [ProductoId] int NOT NULL,
        [Cantidad] int NOT NULL,
        [FechaAgregado] datetime2 NOT NULL,
        CONSTRAINT [PK_CarritoItems] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CarritoItems_Carritos_CarritoId] FOREIGN KEY ([CarritoId]) REFERENCES [Carritos] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_CarritoItems_Productos_ProductoId] FOREIGN KEY ([ProductoId]) REFERENCES [Productos] ([Id]) ON DELETE CASCADE
    );
    
    CREATE INDEX [IX_CarritoItems_CarritoId] ON [CarritoItems] ([CarritoId]);
    CREATE INDEX [IX_CarritoItems_ProductoId] ON [CarritoItems] ([ProductoId]);
END;

-- 4. Verificación de Tablas de Pedidos
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Pedidos' AND xtype='U')
BEGIN
    CREATE TABLE [Pedidos] (
        [Id] int NOT NULL IDENTITY,
        [UsuarioId] int NOT NULL,
        [FechaPedido] datetime2 NOT NULL,
        [Estado] nvarchar(max) NOT NULL,
        [Total] decimal(18,2) NOT NULL,
        [DireccionEnvioId] int NULL,
        [MetodoPagoId] int NULL,
        [Aprobado] bit NOT NULL DEFAULT 0,
        [EsPersonalizado] bit NOT NULL DEFAULT 0,
        [FechaCreacion] datetime2 NOT NULL DEFAULT GETDATE(),
        [FechaActualizacion] datetime2 NULL,
        CONSTRAINT [PK_Pedidos] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Pedidos_Users_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
    CREATE INDEX [IX_Pedidos_UsuarioId] ON [Pedidos] ([UsuarioId]);
END;

-- 5. Tabla PedidoItems
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PedidoItems' AND xtype='U')
BEGIN
    CREATE TABLE [PedidoItems] (
        [Id] int NOT NULL IDENTITY,
        [PedidoId] int NOT NULL,
        [ProductoId] int NOT NULL,
        [Cantidad] int NOT NULL,
        [PrecioUnitario] decimal(18,2) NOT NULL,
        [Subtotal] decimal(18,2) NOT NULL,
        CONSTRAINT [PK_PedidoItems] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_PedidoItems_Pedidos_PedidoId] FOREIGN KEY ([PedidoId]) REFERENCES [Pedidos] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_PedidoItems_Productos_ProductoId] FOREIGN KEY ([ProductoId]) REFERENCES [Productos] ([Id]) ON DELETE CASCADE
    );
    CREATE INDEX [IX_PedidoItems_PedidoId] ON [PedidoItems] ([PedidoId]);
    CREATE INDEX [IX_PedidoItems_ProductoId] ON [PedidoItems] ([PedidoId]);
END;


-- 6. Tabla Notificaciones
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Notificaciones' AND xtype='U')
BEGIN
     CREATE TABLE [Notificaciones] (
        [Id] int NOT NULL IDENTITY,
        [UsuarioId] int NOT NULL,
        [Titulo] nvarchar(max) NOT NULL,
        [Mensaje] nvarchar(max) NOT NULL,
        [Leida] bit NOT NULL DEFAULT 0,
        [Tipo] nvarchar(max) NOT NULL, -- 'Info', 'Warning', 'Success', 'Error'
        [FechaCreacion] datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_Notificaciones] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Notificaciones_Users_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
     CREATE INDEX [IX_Notificaciones_UsuarioId] ON [Notificaciones] ([UsuarioId]);
END
ELSE
BEGIN
    -- Migrate existing table: Add missing columns if they don't exist
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Notificaciones]') AND name = 'Titulo')
    BEGIN
        ALTER TABLE [Notificaciones] ADD [Titulo] nvarchar(max) NOT NULL DEFAULT 'Notificación';
    END;
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Notificaciones]') AND name = 'FechaCreacion')
    BEGIN
        ALTER TABLE [Notificaciones] ADD [FechaCreacion] datetime2 NOT NULL DEFAULT GETDATE();
    END;
    
    -- Drop old Fecha column if it exists
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Notificaciones]') AND name = 'Fecha')
    BEGIN
        ALTER TABLE [Notificaciones] DROP COLUMN [Fecha];
    END;
END;
";
        context.Database.ExecuteSqlRaw(sql);
        Console.WriteLine("✅ Tablas verificadas y creadas correctamente.");

        // Seed initial categories (Check individually so new ones like 'Bebidas' are added even if others exist)
        var targetCategories = new List<CategoriaProducto>
        {
            new CategoriaProducto { Nombre = "Pasteles", Descripcion = "Pasteles y tortas para toda ocasión", Activa = true },
            new CategoriaProducto { Nombre = "Croissants", Descripcion = "Croissants artesanales recién horneados", Activa = true },
            new CategoriaProducto { Nombre = "Galletas", Descripcion = "Galletas caseras y gourmet", Activa = true },
            new CategoriaProducto { Nombre = "Panes", Descripcion = "Panes artesanales y especiales", Activa = true },
            new CategoriaProducto { Nombre = "Macarons", Descripcion = "Macarons franceses de diferentes sabores", Activa = true },
            new CategoriaProducto { Nombre = "Tartas", Descripcion = "Tartas dulces y saladas", Activa = true },
            new CategoriaProducto { Nombre = "Cupcakes", Descripcion = "Cupcakes decorados para eventos", Activa = true },
            new CategoriaProducto { Nombre = "Postres", Descripcion = "Postres variados y especiales", Activa = true },
            new CategoriaProducto { Nombre = "Bebidas", Descripcion = "Bebidas calientes y frías", Activa = true }
        };

        foreach (var cat in targetCategories)
        {
            if (!context.Set<CategoriaProducto>().Any(c => c.Nombre == cat.Nombre))
            {
                context.Set<CategoriaProducto>().Add(cat);
                Console.WriteLine($"📦 Agregando categoría faltante: {cat.Nombre}");
            }
        }
        context.SaveChanges();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️ Error al verificar base de datos: {ex.Message}");
    }
}

// Habilitar archivos estáticos para servir imágenes
app.UseStaticFiles();

app.UseMiddleware<GlobalExceptionMiddleware>();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ============ MENSAJE DE INICIO ============
app.Logger.LogInformation("🍰 Pastisserie API iniciada correctamente");
app.Logger.LogInformation("📊 Base de datos: {ConnectionString}",
    builder.Configuration.GetConnectionString("DefaultConnection")?.Split(';')[0]);

app.Run();