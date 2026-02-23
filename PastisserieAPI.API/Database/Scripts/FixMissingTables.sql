-- Script para asegurar que las tablas necesarias existen
-- Ejecutar en la base de datos SQL Server

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

-- 4. Verificación de Tablas de Pedidos (por si acaso)
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
    CREATE INDEX [IX_PedidoItems_ProductoId] ON [PedidoItems] ([ProductoId]);
END;

-- Verificar existencia de tabla Notifications
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
END;
