import api from '../api/axios';
import type { ApiResponse } from '../types';

export interface Promocion {
    id: number;
    nombre: string;
    descripcion: string;
    descuentoPorcentaje: number;
    fechaInicio: string;
    fechaFin: string;
    activo: boolean;
    imagenUrl?: string;
}

export const promocionesService = {
    getAll: async (): Promise<ApiResponse<Promocion[]>> => {
        const response = await api.get<ApiResponse<Promocion[]>>('/promociones');
        return response.data;
    },

    getById: async (id: number): Promise<ApiResponse<Promocion>> => {
        const response = await api.get<ApiResponse<Promocion>>(`/promociones/${id}`);
        return response.data;
    },

    create: async (promocion: Partial<Promocion>): Promise<ApiResponse<Promocion>> => {
        const response = await api.post<ApiResponse<Promocion>>('/promociones', promocion);
        return response.data;
    },

    update: async (id: number, promocion: Partial<Promocion>): Promise<ApiResponse<Promocion>> => {
        const response = await api.put<ApiResponse<Promocion>>(`/promociones/${id}`, promocion);
        return response.data;
    },

    delete: async (id: number): Promise<ApiResponse<void>> => {
        const response = await api.delete<ApiResponse<void>>(`/promociones/${id}`);
        return response.data;
    }
};
