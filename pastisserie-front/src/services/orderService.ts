import api from '../api/axios';

// Interfaces (deben coincidir con lo que devuelve tu Backend)
export interface PedidoItem {
  productoId: number;
  nombreProducto?: string; // El backend a veces lo manda anidado, lo ajustaremos si hace falta
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  usuarioId: number;
  usuarioNombre?: string;
  fechaPedido: string; // Ojo: coincidir con el backend (FechaCreacion/FechaPedido)
  total: number;
  estado: string;
  direccionEnvio?: string; // O el objeto completo si viene detallado
  items: PedidoItem[];
}

export const orderService = {
  // 1. Crear pedido (Checkout)
  createOrder: async (orderData: {
    direccion: string,
    telefono: string,
    metodoPago: string,
    notas?: string
  }) => {
    // El backend (CreatePedidoRequestDto) ya tiene campos para MetodoPago y Direccion
    const payload = {
      MetodoPagoId: 0, // El backend lo ignora si mandamos el string
      DireccionEnvioId: null,
      MetodoPago: orderData.metodoPago,
      Direccion: orderData.direccion,
      NotasCliente: `Teléfono: ${orderData.telefono}${orderData.notas ? ` | Notas: ${orderData.notas}` : ''}`,
      Items: [] // El backend toma los items del carrito actual de la sesión/usuario
    };

    const response = await api.post('/pedidos', payload);
    return response.data;
  },

  // 2. Obtener mis pedidos (Cliente)
  getMyOrders: async () => {
    const response = await api.get('/pedidos/mis-pedidos');
    // Aseguramos devolver la lista, a veces viene dentro de { data: [...] }
    return response.data.data || response.data;
  },

  // 3. Obtener TODOS los pedidos (Admin)
  getAllOrders: async () => {
    // Usamos el endpoint de pendientes o el general según tu controller
    const response = await api.get('/pedidos');
    return response.data.data || response.data;
  },

  // 4. Cambiar estado (Admin)
  updateStatus: async (pedidoId: number, nuevoEstado: string) => {
    const response = await api.put(`/pedidos/${pedidoId}/estado`, {
      estado: nuevoEstado
    });
    return response.data;
  }
};