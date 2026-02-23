import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiX, FiSave, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/format';

interface Promocion {
    id: number;
    nombre: string;
    descripcion?: string;
    tipoDescuento: string;
    valor: number;
    codigoPromocional?: string;
    fechaInicio: string;
    fechaFin: string;
    activo: boolean;
    imagenUrl?: string;
}

const initialFormState = {
    nombre: '',
    descripcion: '',
    tipoDescuento: 'Porcentaje',
    valor: 0,
    codigoPromocional: '',
    fechaInicio: '',
    fechaFin: '',
    activo: true,
    imagenUrl: ''
};

const PromocionesAdmin = () => {
    const [promociones, setPromociones] = useState<Promocion[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchPromociones();
    }, []);

    const fetchPromociones = async () => {
        try {
            const response = await api.get('/promociones');
            let data = [];
            if (Array.isArray(response.data)) data = response.data;
            else if (response.data?.data && Array.isArray(response.data.data)) data = response.data.data;
            setPromociones(data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar promociones');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked :
            type === 'number' ? Number(value) : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const openNewModal = () => {
        setFormData(initialFormState);
        setIsEditing(false);
        setShowModal(true);
    };

    const openEditModal = (promo: Promocion) => {
        setFormData({
            nombre: promo.nombre,
            descripcion: promo.descripcion || '',
            tipoDescuento: promo.tipoDescuento,
            valor: promo.valor,
            codigoPromocional: promo.codigoPromocional || '',
            // Formatear fechas para input datetime-local o date si es necesario (YYYY-MM-DD)
            fechaInicio: promo.fechaInicio.split('T')[0],
            fechaFin: promo.fechaFin.split('T')[0],
            activo: promo.activo,
            imagenUrl: promo.imagenUrl || ''
        });
        setCurrentId(promo.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                // Asegurar fechas completas ISO si el backend lo requiere, pero normalmente YYYY-MM-DD funciona si es DateTime
                fechaInicio: new Date(formData.fechaInicio).toISOString(),
                fechaFin: new Date(formData.fechaFin).toISOString()
            };

            if (isEditing && currentId) {
                await api.put(`/promociones/${currentId}`, { ...payload, id: currentId });
                toast.success('Promoción actualizada');
            } else {
                await api.post('/promociones', payload);
                toast.success('Promoción creada');
            }
            setShowModal(false);
            fetchPromociones();
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar promoción');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Eliminar esta promoción?')) return;
        try {
            await api.delete(`/promociones/${id}`);
            toast.success('Promoción eliminada');
            fetchPromociones();
        } catch (error) {
            console.error(error);
            toast.error('No se pudo eliminar');
        }
    };

    const filteredPromos = promociones.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Promociones</h1>
                    <p className="text-gray-500">Gestiona descuentos y ofertas especiales</p>
                </div>
                <button onClick={openNewModal} className="bg-[#7D2121] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-red-900 transition-colors shadow-md">
                    <FiPlus /> Nueva Promoción
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                    <FiSearch className="text-gray-400" />
                    <input
                        className="bg-transparent w-full outline-none text-sm"
                        placeholder="Buscar promoción..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-100 text-gray-500 uppercase font-bold text-xs">
                            <tr>
                                <th className="px-6 py-4">Nombre</th>
                                <th className="px-6 py-4">Descuento</th>
                                <th className="px-6 py-4">Vigencia</th>
                                <th className="px-6 py-4">Código</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-8">Cargando...</td></tr>
                            ) : filteredPromos.map(promo => (
                                <tr key={promo.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-bold text-gray-800">{promo.nombre}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold text-xs">
                                            {promo.tipoDescuento === 'Porcentaje' ? `${promo.valor}%` : formatCurrency(promo.valor)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        <div className="flex flex-col">
                                            <span>De: {new Date(promo.fechaInicio).toLocaleDateString()}</span>
                                            <span>A: {new Date(promo.fechaFin).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">{promo.codigoPromocional || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${promo.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {promo.activo ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button onClick={() => openEditModal(promo)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><FiEdit /></button>
                                        <button onClick={() => handleDelete(promo.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><FiTrash2 /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="bg-[#7D2121] text-white px-6 py-4 flex justify-between items-center">
                            <h2 className="font-bold">{isEditing ? 'Editar Promoción' : 'Nueva Promoción'}</h2>
                            <button onClick={() => setShowModal(false)}><FiX size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                                <input required name="nombre" value={formData.nombre} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-200" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                                <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-200 resize-none h-20" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Tipo Descuento</label>
                                    <select name="tipoDescuento" value={formData.tipoDescuento} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-200">
                                        <option value="Porcentaje">Porcentaje (%)</option>
                                        <option value="MontoFijo">Monto Fijo ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Valor</label>
                                    <input required type="number" name="valor" value={formData.valor} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-200" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Fecha Inicio</label>
                                    <input required type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-200" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Fecha Fin</label>
                                    <input required type="date" name="fechaFin" value={formData.fechaFin} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-200" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Código Promocional (Opcional)</label>
                                <div className="relative">
                                    <FiTag className="absolute left-3 top-3 text-gray-400" />
                                    <input name="codigoPromocional" value={formData.codigoPromocional} onChange={handleInputChange} className="w-full border rounded-lg pl-10 pr-3 py-2 outline-none focus:ring-2 focus:ring-red-200 uppercase" placeholder="Ej. VERANO2026" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="activo" name="activo" checked={formData.activo} onChange={handleInputChange} className="w-4 h-4 text-red-600 rounded focus:ring-red-500" />
                                <label htmlFor="activo" className="text-sm text-gray-700">Promoción Activa</label>
                            </div>

                            <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="px-6 py-2 bg-[#7D2121] text-white rounded-lg hover:bg-red-900 transition-colors font-bold flex items-center gap-2"><FiSave /> Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromocionesAdmin;
