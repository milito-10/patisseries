-- Seed initial product categories for Pastisserie
USE [pastisserie_db];
GO

-- Insert default categories if they don't exist
IF NOT EXISTS (SELECT * FROM CategoriasProducto WHERE Nombre = 'Pasteles')
BEGIN
    INSERT INTO CategoriasProducto (Nombre, Descripcion, Activa)
    VALUES ('Pasteles', 'Pasteles y tortas para toda ocasión', 1);
END

IF NOT EXISTS (SELECT * FROM CategoriasProducto WHERE Nombre = 'Croissants')
BEGIN
    INSERT INTO CategoriasProducto (Nombre, Descripcion, Activa)
    VALUES ('Croissants', 'Croissants artesanales recién horneados', 1);
END

IF NOT EXISTS (SELECT * FROM CategoriasProducto WHERE Nombre = 'Galletas')
BEGIN
    INSERT INTO CategoriasProducto (Nombre, Descripcion, Activa)
    VALUES ('Galletas', 'Galletas caseras y gourmet', 1);
END

IF NOT EXISTS (SELECT * FROM CategoriasProducto WHERE Nombre = 'Panes')
BEGIN
    INSERT INTO CategoriasProducto (Nombre, Descripcion, Activa)
    VALUES ('Panes', 'Panes artesanales y especiales', 1);
END

IF NOT EXISTS (SELECT * FROM CategoriasProducto WHERE Nombre = 'Macarons')
BEGIN
    INSERT INTO CategoriasProducto (Nombre, Descripcion, Activa)
    VALUES ('Macarons', 'Macarons franceses de diferentes sabores', 1);
END

IF NOT EXISTS (SELECT * FROM CategoriasProducto WHERE Nombre = 'Tartas')
BEGIN
    INSERT INTO CategoriasProducto (Nombre, Descripcion, Activa)
    VALUES ('Tartas', 'Tartas dulces y saladas', 1);
END

IF NOT EXISTS (SELECT * FROM CategoriasProducto WHERE Nombre = 'Cupcakes')
BEGIN
    INSERT INTO CategoriasProducto (Nombre, Descripcion, Activa)
    VALUES ('Cupcakes', 'Cupcakes decorados para eventos', 1);
END

IF NOT EXISTS (SELECT * FROM CategoriasProducto WHERE Nombre = 'Postres')
BEGIN
    INSERT INTO CategoriasProducto (Nombre, Descripcion, Activa)
    VALUES ('Postres', 'Postres variados y especiales', 1);
END

PRINT 'Categories seeded successfully';
GO
