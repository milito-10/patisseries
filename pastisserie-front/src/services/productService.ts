import api from '../api/axios';
import { type Producto } from '../types';

export const productService = {
  // --- PÚBLICO ---
  getAll: async () => {
    const response = await api.get('/productos');
    return response.data;
  },

  getById: async (id: string | number) => {
    const response = await api.get(`/productos/${id}`);
    return response.data;
  },

  // --- ADMIN (Gestión) ---
  create: async (producto: Omit<Producto, 'id'>) => {
    // Nota: El backend espera un objeto que coincida con CreateProductoRequestDto
    const payload = {
      Nombre: producto.nombre,
      Descripcion: producto.descripcion,
      Precio: Number(producto.precio),
      Stock: Number(producto.stock),
      ImagenUrl: producto.imagenUrl,
      Categoria: producto.categoria || 'Sin Categoría',
      EsPersonalizable: !!producto.esPersonalizable
    };
    const response = await api.post('/productos', payload);
    return response.data;
  },

  update: async (id: number, producto: Partial<Producto>) => {
    const payload = {
      Nombre: producto.nombre,
      Descripcion: producto.descripcion,
      Precio: producto.precio ? Number(producto.precio) : undefined,
      Stock: producto.stock ? Number(producto.stock) : undefined,
      ImagenUrl: producto.imagenUrl,
      Categoria: producto.categoria
    };
    const response = await api.put(`/productos/${id}`, payload);
    return response.data;
  },


  delete: async (id: number) => {
    const response = await api.delete(`/productos/${id}`);
    return response.data;
  }
};