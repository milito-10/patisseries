import api from './axios';

export interface Notificacion {
    id: number;
    titulo: string;
    mensaje: string;
    leida: boolean;
    tipo: 'Info' | 'Warning' | 'Success' | 'Error';
    fechaCreacion: string;
}

export const notificacionService = {
    getMisNotificaciones: async () => {
        const response = await api.get<any>('/notificaciones');
        return response.data; // ApiResponse<List>
    },

    marcarLeida: async (id: number) => {
        const response = await api.put<any>(`/notificaciones/${id}/leer`);
        return response.data;
    },

    marcarTodasLeidas: async () => {
        const response = await api.put<any>('/notificaciones/leer-todas');
        return response.data;
    }
};
