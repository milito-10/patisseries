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
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_CarritoItems_CarritoId' AND object_id = OBJECT_ID('CarritoItems'))
BEGIN
    CREATE INDEX [IX_CarritoItems_CarritoId] ON [CarritoItems] ([CarritoId]);
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_CarritoItems_ProductoId' AND object_id = OBJECT_ID('CarritoItems'))
BEGIN
    CREATE INDEX [IX_CarritoItems_ProductoId] ON [CarritoItems] ([ProductoId]);
END;
