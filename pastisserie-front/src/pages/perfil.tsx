import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiPhone, FiMapPin, FiSave, FiPackage, FiClock, FiCheckCircle, FiX } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/format';

import { type Pedido } from '../types';

const Perfil = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    telefono: user?.telefono || '',
    direccion: (user as any)?.direccion || '',
  });

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [shake, setShake] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);

  useEffect(() => {
    if (user) {
      fetchMisPedidos();
    }
  }, [user]);

  const fetchMisPedidos = async () => {
    try {
      setLoadingPedidos(true);
      const response = await api.get('/pedidos/mis-pedidos');
      setPedidos(response.data.data || []);
    } catch (error) {
      console.error("Error cargando pedidos", error);
    } finally {
      setLoadingPedidos(false);
    }
  };

  const validate = () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return false;
    }
    if (!formData.telefono.trim()) {
      toast.error('El teléfono es obligatorio');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    // Assuming updateProfile is still needed, if not, remove this line or replace with logout logic
    // await updateProfile(formData);
    toast.success('Perfil actualizado correctamente'); // Placeholder for actual update logic
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Entregado': return 'bg-green-100 text-green-700';
      case 'Pendiente': return 'bg-red-100 text-red-700';
      case 'Enviado': return 'bg-blue-100 text-blue-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'Entregado': return <FiCheckCircle />;
      case 'Pendiente': return <FiClock />;
      case 'Enviado': return <FiPackage />;
      default: return <FiClock />;
    }
  };

  if (!user) return (
    <div className="min-h-screen pt-32 flex justify-center">
      <p>Inicia sesión para ver tu perfil</p>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 bg-patisserie-cream/30">
      <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Columna Izquierda: Datos de Perfil */}
        <div className="lg:col-span-1">
          <div className={`bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 sticky top-28 ${shake ? 'animate-shake' : ''}`}>
            <div className="bg-patisserie-dark h-24 relative">
              <div className="absolute -bottom-10 left-6">
                <div className="w-20 h-20 bg-patisserie-red rounded-2xl shadow-lg flex items-center justify-center text-white text-3xl font-serif">
                  {user.nombre.charAt(0)}
                </div>
              </div>
            </div>

            <div className="pt-12 p-6">
              <h1 className="text-2xl font-serif font-bold text-patisserie-dark">{user.nombre}</h1>
              <p className="text-gray-500 mb-6 text-sm">{user.email}</p>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nombre</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-patisserie-red focus:border-patisserie-red outline-none transition-all"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Teléfono</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="tel"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-patisserie-red focus:border-patisserie-red outline-none transition-all"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dirección</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-patisserie-red focus:border-patisserie-red outline-none transition-all"
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-patisserie-dark text-white font-bold py-3 rounded-xl hover:bg-patisserie-red transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
                >
                  <FiSave />
                  Actualizar
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Pedidos Recientes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-patisserie-dark flex items-center gap-2">
                <FiPackage className="text-patisserie-red" /> Mis Pedidos
              </h2>
              <span className="bg-patisserie-cream px-3 py-1 rounded-full text-patisserie-dark text-xs font-bold">
                {pedidos.length} órdenes
              </span>
            </div>

            {loadingPedidos ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-10 h-10 border-2 border-patisserie-red/20 border-t-patisserie-red rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-400 text-sm">Cargando tu historial...</p>
              </div>
            ) : pedidos.length === 0 ? (
              <div className="py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                <FiPackage className="text-5xl text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Aún no has realizado pedidos</p>
                <p className="text-gray-400 text-sm mb-6">¡Explora nuestro catálogo y date un gusto!</p>
                <a href="/productos" className="text-patisserie-red font-bold hover:underline uppercase text-xs tracking-widest">
                  Ir a la tienda
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {pedidos.map((pedido) => (
                  <div key={pedido.id} className="group border border-gray-100 rounded-2xl p-5 hover:border-patisserie-red/20 hover:shadow-md transition-all">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-patisserie-dark/40 group-hover:bg-patisserie-red/5 group-hover:text-patisserie-red transition-colors">
                          <FiClock size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-patisserie-dark text-lg">Pedido #{pedido.id}</p>
                          <p className="text-xs text-gray-400">{new Date(pedido.fechaPedido).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</p>
                          <p className="font-bold text-patisserie-red text-xl">{formatCurrency(pedido.total)}</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${getStatusColor(pedido.estado)}`}>
                          {pedido.estado}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-50 mt-3">
                      <div className="flex flex-col flex-1 min-w-[200px]">
                        <span className="text-[10px] font-black text-patisserie-red/60 uppercase tracking-widest mb-1">Productos en este pedido</span>
                        <p className="text-sm font-bold text-gray-700 leading-snug">
                          {pedido.items && pedido.items.length > 0 ? (
                            pedido.items.map((it, idx) => (
                              <span key={it.id || idx}>
                                {it.nombreProducto || 'Producto'}{idx < pedido.items.length - 1 ? ', ' : ''}
                              </span>
                            ))
                          ) : 'Sin productos'}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedPedido(pedido)}
                        className="bg-patisserie-red/10 text-patisserie-red px-4 py-1.5 rounded-lg text-xs font-black hover:bg-patisserie-red hover:text-white transition-all uppercase tracking-widest"
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-patisserie-dark rounded-3xl p-8 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xl font-serif font-bold mb-2">¡Endulza tu día!</h3>
              <p className="text-gray-300 text-sm mb-6 max-w-sm">Si tienes algún problema con tu pedido, no dudes en contactarnos directamente.</p>
              <a href="/contacto" className="bg-patisserie-red hover:bg-white hover:text-patisserie-red text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all inline-flex items-center gap-2">
                <FiPhone /> Soporte al Cliente
              </a>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] text-white/5 group-hover:text-white/10 transition-colors">
              <FiCheckCircle size={160} />
            </div>
          </div>
        </div>

      </div >
      {/* Modal de Detalles de Pedido */}
      {
        selectedPedido && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="bg-patisserie-dark text-white px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-lg">Detalles del Pedido #{selectedPedido.id}</h2>
                  <p className="text-xs opacity-80">{new Date(selectedPedido.fechaPedido).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelectedPedido(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Estado y Resumen */}
                <div className="flex justify-between items-start">
                  <div className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 ${getStatusColor(selectedPedido.estado)}`}>
                    {getStatusIcon(selectedPedido.estado)} {selectedPedido.estado}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400 font-medium">Total Pagado</p>
                    <p className="text-3xl font-black text-patisserie-dark">${selectedPedido.total.toFixed(2)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Envío */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                      <FiMapPin className="text-patisserie-red" /> Información de Envío
                    </h3>
                    <div className="bg-gray-50 p-5 rounded-2xl space-y-3 text-sm border border-gray-100">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-400 uppercase text-[9px]">Dirección:</span>
                        <span className="font-medium text-right">{(selectedPedido.direccionEnvio as any)?.direccion || selectedPedido.direccionEnvio || 'Recogida en tienda'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-400 uppercase text-[9px]">Teléfono:</span>
                        <span className="font-medium text-right">{(selectedPedido.direccionEnvio as any)?.telefono || user?.telefono || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-400 uppercase text-[9px]">Recibe:</span>
                        <span className="font-medium text-right text-patisserie-red">{(selectedPedido.direccionEnvio as any)?.nombreCompleto || user?.nombre}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-black text-gray-800 flex items-center justify-between border-b pb-2 text-[10px] uppercase tracking-widest">
                      <span className="flex items-center gap-2"><FiPackage className="text-patisserie-red" /> Mi Compra</span>
                      <span className="text-gray-400">{selectedPedido.items.length} productos</span>
                    </h3>
                    <div className="space-y-3">
                      {selectedPedido.items.map((item, idx) => (
                        <div key={item.id || idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl border border-transparent hover:border-patisserie-red/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-patisserie-red text-white flex items-center justify-center rounded-lg font-black text-xs">
                              {item.cantidad}
                            </div>
                            <div>
                              <p className="font-black text-gray-800 text-sm">{item.nombreProducto || 'Producto'}</p>
                              <p className="text-gray-400 text-[10px]">C/U: ${item.precioUnitario?.toLocaleString() || (item.subtotal / item.cantidad).toLocaleString()}</p>
                            </div>
                          </div>
                          <p className="font-black text-patisserie-dark text-lg">${item.subtotal.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Desglose */}
                {(selectedPedido.subtotal !== undefined || selectedPedido.costoEnvio !== undefined) && (
                  <div className="border-t pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span>${(selectedPedido.subtotal || (selectedPedido.total - (selectedPedido.costoEnvio || 0))).toFixed(2)}</span>
                    </div>
                    {selectedPedido.costoEnvio !== undefined && selectedPedido.costoEnvio > 0 && (
                      <div className="flex justify-between text-gray-500">
                        <span>Envío</span>
                        <span>${selectedPedido.costoEnvio.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg text-patisserie-dark border-t pt-2">
                      <span>Total</span>
                      <span>${selectedPedido.total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
                <button
                  onClick={() => setSelectedPedido(null)}
                  className="bg-patisserie-dark text-white px-8 py-2 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Perfil;
