import api from './axios';

export interface Categoria {
    id: number;
    nombre: string;
    descripcion?: string;
    activa: boolean;
}

export const categoriasService = {
    getAll: async () => {
        const response = await api.get<{ success: boolean; data: Categoria[] }>('/categorias');
        return response.data;
    },

    create: async (categoria: Partial<Categoria>) => {
        const response = await api.post<{ success: boolean; data: Categoria }>('/categorias', categoria);
        return response.data;
    },

    update: async (id: number, categoria: Partial<Categoria>) => {
        const response = await api.put<{ success: boolean; data: Categoria }>(`/categorias/${id}`, categoria);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete<{ success: boolean; message: string }>(`/categorias/${id}`);
        return response.data;
    }
};
