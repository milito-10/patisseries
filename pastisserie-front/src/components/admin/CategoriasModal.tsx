import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiEdit2, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { categoriasService } from '../../api/categoriasService';
import type { Categoria } from '../../api/categoriasService';

interface CategoriasModalProps {
    onClose: () => void;
    onChange: () => void; // Para recargar la lista en el padre
}

const CategoriasModal: React.FC<CategoriasModalProps> = ({ onClose, onChange }) => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editNombre, setEditNombre] = useState('');
    const [newNombre, setNewNombre] = useState('');

    useEffect(() => {
        loadCategorias();
    }, []);

    const loadCategorias = async () => {
        try {
            const response = await categoriasService.getAll();
            if (response.success && Array.isArray(response.data)) {
                setCategorias(response.data);
            }
        } catch (error) {
            toast.error('Error al cargar categorías');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newNombre.trim()) return;
        try {
            await categoriasService.create({ nombre: newNombre, activa: true });
            toast.success('Categoría creada');
            setNewNombre('');
            loadCategorias();
            onChange();
        } catch (error) {
            toast.error('Error al crear categoría');
        }
    };

    const handleUpdate = async (id: number) => {
        if (!editNombre.trim()) return;
        try {
            await categoriasService.update(id, { id, nombre: editNombre, activa: true });
            toast.success('Categoría actualizada');
            setEditingId(null);
            loadCategorias();
            onChange();
        } catch (error) {
            toast.error('Error al actualizar');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Eliminar categoría? Esto podría afectar a los productos asociados.')) return;
        try {
            await categoriasService.delete(id);
            toast.success('Categoría eliminada');
            loadCategorias();
            onChange();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-md">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
                <div className="bg-[#7D2121] text-white px-6 py-5 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-serif font-bold">Gestionar Categorías</h2>
                        <p className="text-xs text-red-100 opacity-80">Administra las clasificaciones de tus productos</p>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors"><FiX size={20} /></button>
                </div>

                <div className="p-6">
                    {/* Input Crear */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Nueva Categoría</label>
                        <div className="flex gap-2">
                            <input
                                value={newNombre}
                                onChange={(e) => setNewNombre(e.target.value)}
                                placeholder="Ej: Bebidas, Postres..."
                                className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all"
                            />
                            <button
                                onClick={handleCreate}
                                disabled={!newNombre.trim()}
                                className="bg-[#7D2121] text-white px-5 rounded-xl hover:bg-red-900 disabled:opacity-50 shadow-md transition-all active:scale-95 flex items-center justify-center"
                            >
                                <FiPlus size={20} />
                            </button>
                        </div>
                    </div>

                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Categorías Existentes</label>
                    {/* Lista */}
                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center py-10">
                                <div className="w-8 h-8 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
                                <p className="mt-2 text-sm text-gray-400">Cargando categorías...</p>
                            </div>
                        ) :
                            categorias.map(cat => (
                                <div key={cat.id} className="flex items-center gap-2 p-1 group">
                                    {editingId === cat.id ? (
                                        <div className="flex-1 flex gap-2 animate-fade-in">
                                            <input
                                                autoFocus
                                                value={editNombre}
                                                onChange={(e) => setEditNombre(e.target.value)}
                                                className="flex-1 border border-red-300 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-red-100"
                                            />
                                            <button onClick={() => handleUpdate(cat.id)} className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 shadow-sm"><FiCheck /></button>
                                            <button onClick={() => setEditingId(null)} className="bg-gray-200 text-gray-600 p-2 rounded-lg hover:bg-gray-300"><FiX /></button>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-transparent hover:border-gray-200">
                                            <span className="font-medium text-gray-700">{cat.nombre}</span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setEditingId(cat.id); setEditNombre(cat.nombre); }}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        }
                        {!loading && categorias.length === 0 && (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-400 text-sm italic">No hay categorías aun.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoriasModal;
