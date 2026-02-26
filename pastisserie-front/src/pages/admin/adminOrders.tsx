import { useEffect, useState, Fragment } from 'react';
import api from '../../api/axios';
import {
  FiClock, FiCheckCircle, FiPackage, FiUser, FiEye, FiMapPin, FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// Tipos definidos localmente para asegurar compatibilidad
interface PedidoItem {
  id: number;
  nombreProducto: string;
  cantidad: number;
  subtotal: number;
}

interface PedidoAdmin {
  id: number;
  usuarioId: number;
  nombreUsuario?: string;
  usuario?: {
    nombre: string;
    email: string;
  };
  fechaPedido: string;
  total: number;
  estado: string;
  items: PedidoItem[];
  direccionEnvio?: string;
}

const PedidosAdmin = () => {
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'gestion' | 'historial' | 'todos'>('gestion');
  const [selectedPedido, setSelectedPedido] = useState<PedidoAdmin | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pedidos/todos');
      const listaPedidos = response.data.data || [];
      const sorted = Array.isArray(listaPedidos)
        ? listaPedidos.sort((a: PedidoAdmin, b: PedidoAdmin) => b.id - a.id)
        : [];
      setPedidos(sorted);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id: number, nuevoEstado: string) => {
    try {
      await api.put(`/pedidos/${id}/estado`, { estado: nuevoEstado });
      toast.success(`Pedido #${id} actualizado`);
      fetchPedidos();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };



  const getClientName = (pedido: PedidoAdmin) => {
    if (pedido.usuario?.nombre) return pedido.usuario.nombre;
    if (pedido.nombreUsuario) return pedido.nombreUsuario;
    if (pedido.usuario?.email) return pedido.usuario.email.split('@')[0];
    return 'Cliente Web';
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Entregado': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pendiente': return 'bg-red-100 text-red-700 border-red-200';
      case 'Enviado': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Cancelado': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  // Filtrado de pedidos
  const query = busqueda.toLowerCase().trim().replace('#', '');

  const pedidosFiltrados = pedidos.filter(p => {
    const idMatch = p.id.toString().includes(query);
    const clienteMatch = getClientName(p).toLowerCase().includes(query);
    const estadoMatch = p.estado.toLowerCase().includes(query);
    const matchesBusqueda = !query || idMatch || clienteMatch || estadoMatch;

    // Filtro por fecha
    const fechaPedido = new Date(p.fechaPedido);
    const cumpleInicio = !startDate || fechaPedido >= new Date(startDate + 'T00:00:00');
    const cumpleFin = !endDate || fechaPedido <= new Date(endDate + 'T23:59:59');

    return matchesBusqueda && cumpleInicio && cumpleFin;
  });

  // Si hay búsqueda, mostramos todo lo filtrado ignorando pestañas (para que sirva de verdad)
  // Si no hay búsqueda, respetamos las pestañas.
  const listaAMostrar = query
    ? pedidosFiltrados
    : pedidosFiltrados.filter(p => {
      if (activeTab === 'todos') return true;
      const esActivo = ['Pendiente', 'Confirmado', 'En Preparación', 'Enviado'].includes(p.estado);
      return activeTab === 'gestion' ? esActivo : !esActivo;
    });

  const pedidosActivosCount = pedidos.filter(p => ['Pendiente', 'Confirmado', 'En Preparación', 'Enviado'].includes(p.estado)).length;
  const pedidosHistorialCount = pedidos.filter(p => !['Pendiente', 'Confirmado', 'En Preparación', 'Enviado'].includes(p.estado)).length;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Pedidos</h1>
          <p className="text-gray-500">Administra y despacha tus órdenes.</p>
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Buscar por ID o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7D2121] transition-all bg-white"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FiPackage />
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
          <span className="text-[10px] font-black text-gray-400 uppercase">Filtrar por fecha:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs font-medium text-gray-700 outline-none border-none bg-transparent"
          />
          <span className="text-gray-300">|</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs font-medium text-gray-700 outline-none border-none bg-transparent"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-xs font-bold text-red-500 hover:text-red-700 ml-2"
            >
              <FiX />
            </button>
          )}
        </div>
      </div>

      {/* PESTAÑAS */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab('gestion')}
          className={`pb-3 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'gestion' ? 'border-[#7D2121] text-[#7D2121]' : 'border-transparent text-gray-500'
            }`}
        >
          <FiClock /> En Proceso ({pedidosActivosCount})
        </button>
        <button
          onClick={() => setActiveTab('historial')}
          className={`pb-3 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'historial' ? 'border-[#7D2121] text-[#7D2121]' : 'border-transparent text-gray-500'
            }`}
        >
          <FiCheckCircle /> Historial ({pedidosHistorialCount})
        </button>
        <button
          onClick={() => setActiveTab('todos')}
          className={`pb-3 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'todos' ? 'border-[#7D2121] text-[#7D2121]' : 'border-transparent text-gray-500'
            }`}
        >
          <FiPackage /> Todos ({pedidos.length})
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Productos</th>
                <th className="px-6 py-4 text-center">Acciones</th>
                {activeTab === 'gestion' && <th className="px-6 py-4 text-center">Cambiar Estado</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10">Cargando...</td></tr>
              ) : listaAMostrar.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">No hay pedidos aquí.</td></tr>
              ) : (
                listaAMostrar.map((pedido) => (
                  <Fragment key={pedido.id}>
                    <tr className={`hover:bg-gray-50 transition-colors ${selectedPedido?.id === pedido.id ? 'bg-[#7D2121]/5' : ''}`}>
                      <td className="px-6 py-4 font-bold text-[#7D2121]">#{pedido.id}</td>
                      <td className="px-6 py-4 capitalize flex items-center gap-2">
                        <div className="p-1 bg-gray-100 rounded text-gray-500"><FiUser /></div>
                        {getClientName(pedido)}
                      </td>
                      <td className="px-6 py-4">
                        {/* Arreglo para la fecha inválida */}
                        {new Date(pedido.fechaPedido).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-bold">${pedido.total.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getStatusColor(pedido.estado)}`}>
                          {pedido.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 max-w-[200px]">
                          <span className="text-[11px] font-black text-gray-400 uppercase tracking-tighter">
                            {pedido.items?.length || 0} {pedido.items?.length === 1 ? 'Producto' : 'Productos'}
                          </span>
                          <p className="text-xs font-bold text-gray-700 leading-tight">
                            {pedido.items && pedido.items.length > 0 ? (
                              pedido.items.map((it, idx) => (
                                <span key={it.id}>
                                  {it.nombreProducto}{idx < pedido.items.length - 1 ? ', ' : ''}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-300 italic">Sin productos</span>
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedPedido(pedido)}
                          className="bg-gray-100 hover:bg-[#7D2121] hover:text-white text-gray-600 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all font-bold text-xs mx-auto shadow-sm"
                        >
                          <FiEye /> Detalles
                        </button>
                      </td>
                      {activeTab === 'gestion' && (
                        <td className="px-6 py-4 text-center">
                          <select
                            className="border border-gray-300 rounded p-1.5 text-xs cursor-pointer outline-none focus:border-[#7D2121] bg-white shadow-inner"
                            value={pedido.estado}
                            onChange={(e) => cambiarEstado(pedido.id, e.target.value)}
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="En Preparación">Preparando</option>
                            <option value="Enviado">Enviado</option>
                            <option value="Entregado">Entregado</option>
                            <option value="Cancelado">Cancelar</option>
                          </select>
                        </td>
                      )}
                    </tr>

                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE DETALLES */}
      {selectedPedido && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-scale-in">
            <div className="bg-[#7D2121] text-white px-8 py-5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2"><FiPackage /> Detalle del Pedido #{selectedPedido.id}</h2>
                <p className="text-white/70 text-xs mt-1">{new Date(selectedPedido.fechaPedido).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</p>
              </div>
              <button
                onClick={() => setSelectedPedido(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
              {/* Info Cliente */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FiUser className="text-[#7D2121]" /> Información del Cliente
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs">Nombre:</span>
                      <span className="font-bold text-gray-800 text-sm">{getClientName(selectedPedido)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs">Email:</span>
                      <span className="text-sm">{selectedPedido.usuario?.email || 'N/A'}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-start gap-2">
                        <FiMapPin className="text-[#7D2121] mt-1 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Dirección de Envío</p>
                          <p className="text-sm font-medium">{selectedPedido.direccionEnvio || 'Recogida en tienda'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 rounded-xl p-5 flex justify-between items-center shadow-inner">
                  <span className="font-bold text-gray-600">Total del Pedido</span>
                  <span className="text-2xl font-black text-[#7D2121]">${selectedPedido.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Info Productos */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                  <span className="flex items-center gap-2"><FiPackage className="text-[#7D2121]" /> Productos comprados</span>
                  <span className="bg-[#7D2121] text-white px-2 py-0.5 rounded-full text-[9px]">{selectedPedido.items?.length || 0}</span>
                </h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mt-4">
                  {selectedPedido.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#7D2121]/20 hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#7D2121]/5 text-[#7D2121] flex items-center justify-center rounded-xl font-black text-sm group-hover:bg-[#7D2121] group-hover:text-white transition-colors">
                          {item.cantidad}
                        </div>
                        <div>
                          <p className="font-black text-gray-800 text-sm leading-tight">{item.nombreProducto}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Precio unitario est.: ${(item.subtotal / item.cantidad).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-[#7D2121] text-base">${item.subtotal.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {(!selectedPedido.items || selectedPedido.items.length === 0) && (
                    <p className="text-center py-10 text-gray-400 italic">No hay productos en este pedido.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
              <button
                onClick={() => setSelectedPedido(null)}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold text-sm transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-6 py-2.5 bg-[#7D2121] hover:bg-red-900 text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
              >
                Imprimir Comprobante
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidosAdmin;