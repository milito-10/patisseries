import api from '../api/axios';
import type { ApiResponse, Carrito } from '../types';

// Definimos los tipos de petición
export interface AddToCartRequest {
  productoId: number;
  cantidad: number;
}

export interface UpdateCartItemRequest {
  cantidad: number;
}

export const cartService = {
  // 1. Obtener carrito
  getCart: async (): Promise<ApiResponse<Carrito>> => {
    const response = await api.get<ApiResponse<Carrito>>('/carrito');
    return response.data;
  },

  // 2. Agregar ítem
  addToCart: async (item: AddToCartRequest): Promise<ApiResponse<Carrito>> => {
    const response = await api.post<ApiResponse<Carrito>>('/carrito/items', item);
    return response.data;
  },

  // 3. Actualizar ítem
  updateCartItem: async (itemId: number, data: UpdateCartItemRequest): Promise<ApiResponse<Carrito>> => {
    const response = await api.put<ApiResponse<Carrito>>(`/carrito/items/${itemId}`, data);
    return response.data;
  },

  // 4. Eliminar ítem
  removeFromCart: async (itemId: number): Promise<ApiResponse<string>> => {
    const response = await api.delete<ApiResponse<string>>(`/carrito/items/${itemId}`);
    return response.data;
  },

  // 5. Vaciar carrito (CORREGIDO)
  clearCart: async (): Promise<ApiResponse<string>> => {
    // 👇 AQUÍ ESTABA EL ERROR: Faltaba "/clear"
    const response = await api.delete<ApiResponse<string>>('/carrito/clear');
    return response.data;
  }
};