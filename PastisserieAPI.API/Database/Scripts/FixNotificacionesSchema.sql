-- Fix Notificaciones table schema
-- Add missing columns: Titulo and FechaCreacion

USE [pastisserie_db];
GO

-- Check if Titulo column exists, if not add it
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Notificaciones]') AND name = 'Titulo')
BEGIN
    ALTER TABLE [Notificaciones] ADD [Titulo] nvarchar(max) NOT NULL DEFAULT 'Notificación';
    PRINT 'Column Titulo added successfully';
END
ELSE
BEGIN
    PRINT 'Column Titulo already exists';
END
GO

-- Check if FechaCreacion column exists, if not add it
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Notificaciones]') AND name = 'FechaCreacion')
BEGIN
    ALTER TABLE [Notificaciones] ADD [FechaCreacion] datetime2 NOT NULL DEFAULT GETDATE();
    PRINT 'Column FechaCreacion added successfully';
END
ELSE
BEGIN
    PRINT 'Column FechaCreacion already exists';
END
GO

-- If old Fecha column exists, migrate data and drop it
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Notificaciones]') AND name = 'Fecha')
BEGIN
    -- Update FechaCreacion with Fecha values if FechaCreacion was just added
    UPDATE [Notificaciones] SET [FechaCreacion] = [Fecha] WHERE [FechaCreacion] IS NULL OR [FechaCreacion] = GETDATE();
    
    -- Drop old Fecha column
    ALTER TABLE [Notificaciones] DROP COLUMN [Fecha];
    PRINT 'Old Fecha column migrated and dropped';
END
GO

PRINT 'Notificaciones table schema updated successfully';
