import api from './axios';

export interface Promocion {
    id: number;
    titulo: string; // "Nombre" en BD, pero "Titulo" en frontend anterior? Revisar. BD tiene "Nombre"
    nombre?: string; // Mapeo para evitar error
    descripcion: string;
    tipoDescuento: string;
    valor: number;
    codigoPromocional?: string;
    fechaInicio: string;
    fechaFin: string;
    activo: boolean;
    imagenUrl?: string;
}

export const promocionesService = {
    getAll: async () => {
        const response = await api.get<{ success: boolean; data: Promocion[] }>('/promociones');
        // Aseguramos que data sea un array
        const data = Array.isArray(response.data) ? response.data :
            (response.data.data ? response.data.data : []);

        // Mapeo simple por si el frontend espera 'titulo' pero el backend da 'nombre'
        return data.map((p: any) => ({
            ...p,
            titulo: p.titulo || p.nombre // Fallback
        }));
    }
};
