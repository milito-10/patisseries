import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { notificacionService } from '../../api/notificacionService';
import type { Notificacion } from '../../api/notificacionService';

const Notificaciones: React.FC = () => {
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const cargarNotificaciones = async () => {
        try {
            const response = await notificacionService.getMisNotificaciones();
            if (response.success) {
                setNotificaciones(response.data);
            }
        } catch (error) {
            console.error("Error al cargar notificaciones", error);
        }
    };

    useEffect(() => {
        // Cargar al inicio y cada 60 segundos
        cargarNotificaciones();
        const interval = setInterval(cargarNotificaciones, 60000);
        return () => clearInterval(interval);
    }, []);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarcarLeida = async (id: number) => {
        try {
            await notificacionService.marcarLeida(id);
            setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
        } catch (error) {
            console.error("Error al marcar como leída", error);
        }
    };

    const handleMarcarTodas = async () => {
        try {
            setLoading(true);
            await notificacionService.marcarTodasLeidas();
            setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
            setLoading(false);
        } catch (error) {
            console.error("Error al marcar todas", error);
            setLoading(false);
        }
    };

    const noLeidas = notificaciones.filter(n => !n.leida).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-primary transition-colors focus:outline-none"
            >
                <Bell size={24} />
                {noLeidas > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {noLeidas > 9 ? '9+' : noLeidas}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-100 ring-1 ring-black ring-opacity-5">
                    <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-700">Notificaciones</h3>
                        {noLeidas > 0 && (
                            <button
                                onClick={handleMarcarTodas}
                                disabled={loading}
                                className="text-xs text-primary hover:text-primary-dark font-medium flex items-center"
                            >
                                <Check size={14} className="mr-1" />
                                Marcar todas leídas
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notificaciones.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 text-sm">
                                No tienes notificaciones
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {notificaciones.map(notificacion => (
                                    <li
                                        key={notificacion.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors ${!notificacion.leida ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0 mr-2">
                                                <p className={`text-sm font-medium ${!notificacion.leida ? 'text-gray-900' : 'text-gray-600'}`}>
                                                    {notificacion.titulo}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {notificacion.mensaje}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {new Date(notificacion.fechaCreacion).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {!notificacion.leida && (
                                                <button
                                                    onClick={() => handleMarcarLeida(notificacion.id)}
                                                    className="text-gray-400 hover:text-primary flex-shrink-0"
                                                    title="Marcar como leída"
                                                >
                                                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notificaciones;
