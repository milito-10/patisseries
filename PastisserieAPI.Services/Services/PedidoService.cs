using AutoMapper;
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Services.DTOs.Request;
using PastisserieAPI.Services.DTOs.Response;
using PastisserieAPI.Services.Services.Interfaces;

namespace PastisserieAPI.Services.Services
{
    public class PedidoService : IPedidoService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;

        public PedidoService(IUnitOfWork unitOfWork, IMapper mapper, IEmailService emailService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _emailService = emailService;
        }

        public async Task<PedidoResponseDto> CreateAsync(int userId, CreatePedidoRequestDto request)
        {
            // 1. Obtener el carrito
            var carritoActual = await _unitOfWork.Carritos.GetByUsuarioIdWithItemsAsync(userId);

            if (carritoActual == null || !carritoActual.Items.Any())
            {
                throw new Exception("El carrito está vacío o no existe.");
            }

            // 2. Mapeo inicial
            var pedido = _mapper.Map<Pedido>(request);
            pedido.UsuarioId = userId;
            pedido.FechaPedido = DateTime.UtcNow;
            pedido.FechaCreacion = DateTime.UtcNow;
            pedido.Estado = "Pendiente";

            // 1. Inyectar datos simulados en Notas (para que el Admin lo vea claro)
            var infoEnvio = string.Empty;
            if (!string.IsNullOrEmpty(request.Direccion)) infoEnvio += $"📍 Dirección: {request.Direccion}";
            if (!string.IsNullOrEmpty(request.MetodoPago)) infoEnvio += $"\n💳 Pago: {request.MetodoPago}";
            
            pedido.NotasCliente = string.IsNullOrEmpty(pedido.NotasCliente) 
                ? infoEnvio 
                : $"{pedido.NotasCliente}\n---\n{infoEnvio}";

            // 2. Determinar Método de Pago en BD
            var todosMetodos = await _unitOfWork.MetodosPagoUsuario.GetAllAsync();
            MetodoPagoUsuario? metodoSeleccionado = null;

            // A) Si es Tarjeta Simulada, intentamos crear/usar un método de Tarjeta
            if (!string.IsNullOrEmpty(request.MetodoPago) && request.MetodoPago.Contains("Tarjeta", StringComparison.OrdinalIgnoreCase))
            {
                var todosTipos = await _unitOfWork.TiposMetodoPago.GetAllAsync();
                var tipoTarjeta = todosTipos.FirstOrDefault(t => t.Id == 2) ?? todosTipos.FirstOrDefault(t => t.Nombre.Contains("Tarjeta"));

                if (tipoTarjeta != null)
                {
                    metodoSeleccionado = new MetodoPagoUsuario
                    {
                        UsuarioId = userId,
                        TipoMetodoPagoId = tipoTarjeta.Id,
                        UltimosDigitos = "4242",
                        TokenPago = $"SIM_{Guid.NewGuid().ToString().Substring(0, 8)}",
                        EsPredeterminado = false,
                        FechaCreacion = DateTime.UtcNow
                    };
                    await _unitOfWork.MetodosPagoUsuario.AddAsync(metodoSeleccionado);
                    await _unitOfWork.SaveChangesAsync();
                }
            }

            // B) Si no se seleccionó arriba (o es Efectivo/Otro), usamos lógica por defecto (Existente o Efectivo)
            if (metodoSeleccionado == null)
            {
                metodoSeleccionado = todosMetodos.FirstOrDefault(m => m.UsuarioId == userId);

                if (metodoSeleccionado == null)
                {
                    var todosTipos = await _unitOfWork.TiposMetodoPago.GetAllAsync();
                    var tipo = todosTipos.FirstOrDefault(); // Por defecto el primero (Efectivo)

                    if (tipo == null)
                    {
                        tipo = new TipoMetodoPago { Nombre = "Efectivo", Activo = true };
                        await _unitOfWork.TiposMetodoPago.AddAsync(tipo);
                        await _unitOfWork.SaveChangesAsync();
                    }

                    metodoSeleccionado = new MetodoPagoUsuario
                    {
                        UsuarioId = userId,
                        TipoMetodoPagoId = tipo.Id,
                        UltimosDigitos = "0000",
                        TokenPago = "PAGO_EFECTIVO",
                        EsPredeterminado = true,
                        FechaCreacion = DateTime.UtcNow
                    };

                    await _unitOfWork.MetodosPagoUsuario.AddAsync(metodoSeleccionado);
                    await _unitOfWork.SaveChangesAsync();
                }
            }

            pedido.MetodoPagoId = metodoSeleccionado.Id;

            decimal subtotal = 0;
            var pedidoItems = new List<PedidoItem>();

            // 3. Validar Stock de TODOS los items antes de proceder
            foreach (var itemCart in carritoActual.Items)
            {
                var producto = itemCart.Producto;
                if (producto == null) continue;

                if (producto.Stock < itemCart.Cantidad)
                {
                    throw new Exception($"No hay suficiente stock para {producto.Nombre}. Disponible: {producto.Stock}, Solicitado: {itemCart.Cantidad}");
                }
            }
            foreach (var itemCart in carritoActual.Items)
            {
                var producto = itemCart.Producto;
                if (producto == null) continue;

                var pedidoItem = new PedidoItem
                {
                    ProductoId = itemCart.ProductoId,
                    Cantidad = itemCart.Cantidad,
                    PrecioUnitario = producto.Precio,
                    Subtotal = producto.Precio * itemCart.Cantidad
                };

                subtotal += pedidoItem.Subtotal;
                pedidoItems.Add(pedidoItem);

                // Descontar Stock
                if (producto.Stock >= itemCart.Cantidad)
                {
                    producto.Stock -= itemCart.Cantidad;
                    await _unitOfWork.Productos.UpdateAsync(producto);
                }
            }

            // 4. Totales (AJUSTADOS PARA QUE COINCIDAN CON EL FRONTEND)
            // Asumimos que el precio del producto ya incluye IVA (Precio Final)
            pedido.Total = subtotal; 
            pedido.IVA = subtotal * 0.19m / 1.19m; // 19% incluido en el precio
            pedido.Subtotal = subtotal - pedido.IVA; 
            pedido.CostoEnvio = 0; // Envío gratis por ahora

            // 5. Guardar Pedido (Cabecera)
            await _unitOfWork.Pedidos.AddAsync(pedido);
            await _unitOfWork.SaveChangesAsync();

            // 6. Relacionar Items con el ID del pedido creado
            foreach (var item in pedidoItems)
            {
                item.PedidoId = pedido.Id;
                pedido.Items.Add(item);
            }
            // Actualizamos el pedido con sus items
            await _unitOfWork.Pedidos.UpdateAsync(pedido);

            // 7. Vaciar Carrito (Usando el ID del carrito, NO del usuario)
            await _unitOfWork.Carritos.ClearCarritoAsync(carritoActual.Id);

            // 8. Historial
            var historial = new PedidoHistorial
            {
                PedidoId = pedido.Id,
                EstadoAnterior = "",
                EstadoNuevo = "Pendiente",
                FechaCambio = DateTime.UtcNow,
                CambiadoPor = userId,
                Notas = "Pedido creado exitosamente"
            };
            // Nota: Si PedidoHistorial es una tabla aparte, agrégala al DbSet, si es colección:
            // pedido.Historial.Add(historial); 
            // await _unitOfWork.SaveChangesAsync();

            // Guardamos cambios finales
            await _unitOfWork.SaveChangesAsync();

            // 9. Retorno con datos completos (Include)
            var pedidoCompleto = await _unitOfWork.Pedidos.GetByIdWithDetailsAsync(pedido.Id)
                                 ?? await _unitOfWork.Pedidos.GetByIdAsync(pedido.Id);

            // 10. Enviar Correo de Confirmación (Fire and forget, or awaited)
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user != null)
                {
                    await _emailService.SendOrderConfirmationEmailAsync(user.Email, user.Nombre, pedido.Id, pedido.Total);
                }
            }
            catch { /* Ignorar errores de correo para no fallar el pedido */ }

            return _mapper.Map<PedidoResponseDto>(pedidoCompleto);
        }

        // --- MÉTODOS DE LECTURA ---

        // 👇 ESTE ES EL QUE NECESITA EL DASHBOARD
        public async Task<List<PedidoResponseDto>> GetAllAsync()
        {
            // Llama al repositorio que modificamos anteriormente (con los Includes de Usuario)
            var pedidos = await _unitOfWork.Pedidos.GetAllAsync();
            return _mapper.Map<List<PedidoResponseDto>>(pedidos);
        }

        public async Task<PedidoResponseDto?> GetByIdAsync(int id)
        {
            var pedido = await _unitOfWork.Pedidos.GetByIdWithDetailsAsync(id) ?? await _unitOfWork.Pedidos.GetByIdAsync(id);
            return pedido == null ? null : _mapper.Map<PedidoResponseDto>(pedido);
        }

        public async Task<List<PedidoResponseDto>> GetByUsuarioIdAsync(int usuarioId)
        {
            var pedidos = await _unitOfWork.Pedidos.GetByUsuarioIdAsync(usuarioId);
            return _mapper.Map<List<PedidoResponseDto>>(pedidos);
        }

        public async Task<List<PedidoResponseDto>> GetByEstadoAsync(string estado)
        {
            var pedidos = await _unitOfWork.Pedidos.GetByEstadoAsync(estado);
            return _mapper.Map<List<PedidoResponseDto>>(pedidos);
        }

        public async Task<List<PedidoResponseDto>> GetPedidosPendientesAsync()
        {
            var pedidos = await _unitOfWork.Pedidos.GetPedidosPendientesAsync();
            return _mapper.Map<List<PedidoResponseDto>>(pedidos);
        }

        public async Task<PedidoResponseDto?> UpdateEstadoAsync(int id, UpdatePedidoEstadoRequestDto request)
        {
            var pedido = await _unitOfWork.Pedidos.GetByIdAsync(id);
            if (pedido == null) return null;

            pedido.Estado = request.Estado;
            pedido.FechaActualizacion = DateTime.UtcNow;
            await _unitOfWork.Pedidos.UpdateAsync(pedido);
            await _unitOfWork.SaveChangesAsync();

            // Enviar correo de cambio de estado
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(pedido.UsuarioId);
                if (user != null)
                {
                    await _emailService.SendOrderStatusUpdateEmailAsync(user.Email, user.Nombre, pedido.Id, request.Estado);
                }
            }
            catch { }

            return _mapper.Map<PedidoResponseDto>(pedido);
        }

        public async Task<bool> AprobarPedidoAsync(int id, int aprobadoPor)
        {
            var pedido = await _unitOfWork.Pedidos.GetByIdAsync(id);
            if (pedido == null) return false;

            pedido.Aprobado = true;
            pedido.FechaAprobacion = DateTime.UtcNow;
            pedido.Estado = "Confirmado";
            await _unitOfWork.Pedidos.UpdateAsync(pedido);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}