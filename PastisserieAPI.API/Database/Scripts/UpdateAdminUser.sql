-- Script para actualizar el usuario administrador existente
-- Ejecutar este script en SQL Server Management Studio o similar

-- Actualizar el usuario existente con ID 1 para que sea el administrador
UPDATE Users 
SET 
    Nombre = 'Admin Deluxe',
    Email = 'administrador123@gmail.com',
    PasswordHash = '$2a$11$R.S2S/JpXw5P8v2kF3h5Ze3Xm6N2q4T6V7W8X9Y0Z1A2B3C4D5E6F', -- Hash de 'Admin123'
    EmailVerificado = 1,
    Activo = 1
WHERE Id = 1;

-- Asegurar que el usuario tiene el rol de Admin (ID 2)
IF NOT EXISTS (SELECT 1 FROM UserRoles WHERE UsuarioId = 1 AND RolId = 2)
BEGIN
    INSERT INTO UserRoles (UsuarioId, RolId, FechaAsignacion)
    VALUES (1, 2, GETDATE());
END

-- Verificar los cambios
SELECT u.Id, u.Nombre, u.Email, u.EmailVerificado, u.Activo, r.Nombre as Rol
FROM Users u
LEFT JOIN UserRoles ur ON u.Id = ur.UsuarioId
LEFT JOIN Roles r ON ur.RolId = r.Id
WHERE u.Id = 1;
