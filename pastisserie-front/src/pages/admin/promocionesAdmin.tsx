import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiX, FiSave, FiTag, FiClock } from 'react-icons/fi';
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

const getLocalDateString = () => new Date().toLocaleDateString('sv-SE'); // sv-SE gives YYYY-MM-DD

// Helpers para manejo de fechas locales vs UTC
const formatLocalISO = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
};

const initialFormState = {
    nombre: '',
    descripcion: '',
    tipoDescuento: 'Porcentaje',
    valor: 0,
    codigoPromocional: '',
    fechaInicio: `${getLocalDateString()}T00:00`,
    fechaFin: `${getLocalDateString()}T23:59`,
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
            const response = await api.get('/promociones?mostrarTodas=true');
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
            // Convertir UTC del backend a LOCAL para el input
            fechaInicio: formatLocalISO(promo.fechaInicio),
            fechaFin: formatLocalISO(promo.fechaFin),
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
            if (new Date(formData.fechaFin) <= new Date(formData.fechaInicio)) {
                toast.error('La fecha de fin debe ser posterior a la de inicio');
                return;
            }

            const payload = {
                ...formData,
                // Al crear Date de un string 'YYYY-MM-DDTHH:mm', JS lo toma como LOCAL
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
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1 text-gray-500">
                                                <span className="font-bold text-[9px] uppercase tracking-tighter bg-gray-100 px-1 rounded">Inicio:</span>
                                                <span>{new Date(promo.fechaInicio).toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-patisserie-red">
                                                <span className="font-bold text-[9px] uppercase tracking-tighter bg-red-50 px-1 rounded">Fin:</span>
                                                <span className="font-bold">{new Date(promo.fechaFin).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">{promo.codigoPromocional || '-'}</td>
                                    <td className="px-6 py-4">
                                        {(() => {
                                            const now = new Date();
                                            const start = new Date(promo.fechaInicio);
                                            const end = new Date(promo.fechaFin);

                                            if (!promo.activo) return <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-tighter">Desactiva</span>;
                                            if (now < start) return <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-tighter">Próxima</span>;
                                            if (now > end) return <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700 border border-red-200 uppercase tracking-tighter">Expirada</span>;
                                            return <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200 uppercase tracking-tighter">Vigente</span>;
                                        })()}
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
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20">
                        <div className="bg-[#7D2121] text-white px-8 py-6 flex justify-between items-center relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-xl font-serif font-bold italic">{isEditing ? 'Editar Promoción' : 'Nueva Oferta Especial'}</h2>
                                <p className="text-xs text-white/70">Configura los detalles y vigencia de tu promoción</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="relative z-10 p-2 hover:bg-white/10 rounded-full transition-colors"><FiX size={24} /></button>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        </div>
                        <form onSubmit={handleSave} className="p-0 flex flex-col max-h-[90vh]">
                            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                                {/* SECCIÓN: INFORMACIÓN PRINCIPAL */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[#7D2121]/10 rounded-lg flex items-center justify-center text-[#7D2121]">
                                            <FiTag size={18} />
                                        </div>
                                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Información de la Oferta</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nombre Público de la Promoción</label>
                                            <input
                                                required
                                                name="nombre"
                                                placeholder="Ej: Descuento de Verano 2026"
                                                value={formData.nombre}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#7D2121]/20 focus:bg-white rounded-2xl px-5 py-4 text-gray-800 font-bold outline-none transition-all placeholder:text-gray-300"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Descripción Detallada</label>
                                            <textarea
                                                name="descripcion"
                                                placeholder="Describe los beneficios de esta oferta para tus clientes..."
                                                value={formData.descripcion}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#7D2121]/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-medium text-gray-600 outline-none transition-all resize-none h-28 placeholder:text-gray-300"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECCIÓN: CONFIGURACIÓN ECONÓMICA */}
                                <div className="space-y-6 pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[#7D2121]/10 rounded-lg flex items-center justify-center text-[#7D2121]">
                                            <span className="font-black">$</span>
                                        </div>
                                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Tipo de Descuento</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Modalidad</label>
                                            <select
                                                name="tipoDescuento"
                                                value={formData.tipoDescuento}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#7D2121]/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none transition-all cursor-pointer appearance-none"
                                            >
                                                <option value="Porcentaje">Porcentaje (%)</option>
                                                <option value="MontoFijo">Monto Fijo ($)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Valor a Descontar</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="number"
                                                    name="valor"
                                                    value={formData.valor}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#7D2121]/20 focus:bg-white rounded-2xl px-5 py-4 text-lg font-black text-[#7D2121] outline-none transition-all"
                                                />
                                                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-gray-400">
                                                    {formData.tipoDescuento === 'Porcentaje' ? '%' : '$'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECCIÓN: VIGENCIA Y CÓDIGO */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#7D2121]/10 rounded-lg flex items-center justify-center text-[#7D2121]">
                                                <FiClock size={18} />
                                            </div>
                                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Periodo de Validez</h3>
                                        </div>

                                        <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 space-y-8">
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex justify-between">
                                                    <span>Inicio (Día y Hora)</span>
                                                    <span className="text-[#60A5FA]">Inicia hoy</span>
                                                </label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="date"
                                                        value={formData.fechaInicio.split('T')[0] || getLocalDateString()}
                                                        onChange={e => setFormData(p => ({ ...p, fechaInicio: `${e.target.value}T${p.fechaInicio.split('T')[1] || '00:00'}` }))}
                                                        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-4 text-xs font-bold focus:ring-4 focus:ring-[#7D2121]/5 focus:border-[#7D2121]/30 outline-none transition-all shadow-sm"
                                                    />
                                                    <input
                                                        type="time"
                                                        value={formData.fechaInicio.split('T')[1]?.slice(0, 5) || '00:00'}
                                                        onChange={e => setFormData(p => ({ ...p, fechaInicio: `${p.fechaInicio.split('T')[0] || getLocalDateString()}T${e.target.value}` }))}
                                                        className="w-28 bg-white border border-gray-200 rounded-xl px-3 py-4 text-xs font-bold focus:ring-4 focus:ring-[#7D2121]/5 focus:border-[#7D2121]/30 outline-none transition-all shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex justify-between">
                                                    <span>Cierre (Día y Hora)</span>
                                                    <span className="text-patisserie-red">Expira pronto</span>
                                                </label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="date"
                                                        value={formData.fechaFin.split('T')[0] || getLocalDateString()}
                                                        onChange={e => setFormData(p => ({ ...p, fechaFin: `${e.target.value}T${p.fechaFin.split('T')[1] || '23:59'}` }))}
                                                        className={`flex-1 bg-white border rounded-xl px-4 py-4 text-xs font-bold outline-none focus:ring-4 transition-all shadow-sm ${formData.fechaInicio && formData.fechaFin && new Date(formData.fechaFin) <= new Date(formData.fechaInicio) ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-[#7D2121]/5 focus:border-[#7D2121]/30'}`}
                                                    />
                                                    <input
                                                        type="time"
                                                        value={formData.fechaFin.split('T')[1]?.slice(0, 5) || '23:59'}
                                                        onChange={e => setFormData(p => ({ ...p, fechaFin: `${p.fechaFin.split('T')[0] || getLocalDateString()}T${e.target.value}` }))}
                                                        className={`w-28 bg-white border rounded-xl px-3 py-4 text-xs font-bold outline-none focus:ring-4 transition-all shadow-sm ${formData.fechaInicio && formData.fechaFin && new Date(formData.fechaFin) <= new Date(formData.fechaInicio) ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-[#7D2121]/5 focus:border-[#7D2121]/30'}`}
                                                    />
                                                </div>
                                            </div>
                                            {formData.fechaInicio && formData.fechaFin && new Date(formData.fechaFin) <= new Date(formData.fechaInicio) && (
                                                <p className="bg-red-50 text-[10px] text-red-600 font-bold p-3 rounded-xl flex items-center gap-2 animate-bounce">
                                                    <FiX /> Error: El cierre debe ser después del inicio
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#7D2121]/10 rounded-lg flex items-center justify-center text-[#7D2121]">
                                                <FiEdit size={18} />
                                            </div>
                                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Ajustes Finales</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Código Promocional</label>
                                                <input
                                                    name="codigoPromocional"
                                                    value={formData.codigoPromocional}
                                                    onChange={handleInputChange}
                                                    placeholder="OPCIONAL (EJ: VERANO10)"
                                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#7D2121]/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-black text-gray-700 outline-none transition-all placeholder:text-gray-300 uppercase tracking-widest"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-4 bg-[#7D2121]/5 p-6 rounded-3xl border border-[#7D2121]/10">
                                                <p className="text-[10px] font-black text-[#7D2121] uppercase tracking-[2px]">Visibilidad Web</p>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="activo"
                                                        checked={formData.activo}
                                                        onChange={handleInputChange}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7D2121]"></div>
                                                    <span className="ml-3 text-xs font-bold text-gray-700">Mostrar activamente en la tienda</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-4 text-gray-400 font-bold hover:text-gray-800 transition-colors uppercase text-[10px] tracking-widest"
                                >
                                    Descartar
                                </button>
                                <button
                                    type="submit"
                                    className="px-12 py-4 bg-[#7D2121] text-white rounded-2xl hover:bg-red-900 transition-all font-black flex items-center gap-3 shadow-xl shadow-red-900/20 active:scale-95 uppercase text-xs tracking-widest"
                                >
                                    <FiSave size={20} /> Guardar Promoción
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromocionesAdmin;
