import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  FiClock, FiCheckCircle, FiChevronDown, FiChevronUp, FiPackage, FiUser 
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
}

const PedidosAdmin = () => {
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'gestion' | 'historial'>('gestion');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pedidos/todos'); 
      // Ordenar por ID descendente
      const sorted = Array.isArray(response.data) 
        ? response.data.sort((a: PedidoAdmin, b: PedidoAdmin) => b.id - a.id)
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

  const toggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Helper para sacar el nombre del cliente (tu lógica segura)
  const getClientName = (pedido: PedidoAdmin) => {
    if (pedido.usuario?.nombre) return pedido.usuario.nombre;
    if (pedido.nombreUsuario) return pedido.nombreUsuario;
    if (pedido.usuario?.email) return pedido.usuario.email.split('@')[0];
    return 'Cliente Web'; // Si ves esto, es que el backend no manda datos de usuario
  };

  const getStatusColor = (estado: string) => {
    switch(estado) {
        case 'Entregado': return 'bg-green-100 text-green-700 border-green-200';
        case 'Pendiente': return 'bg-red-100 text-red-700 border-red-200';
        case 'Enviado': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'Cancelado': return 'bg-gray-100 text-gray-500 border-gray-200';
        default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  // Filtrado de pestañas
  const pedidosActivos = pedidos.filter(p => ['Pendiente', 'Confirmado', 'En Preparación', 'Enviado'].includes(p.estado));
  const pedidosHistorial = pedidos.filter(p => ['Entregado', 'Cancelado'].includes(p.estado));
  const listaAMostrar = activeTab === 'gestion' ? pedidosActivos : pedidosHistorial;

  return (
    <div className="animate-fade-in space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Pedidos</h1>
        <p className="text-gray-500">Administra y despacha tus órdenes.</p>
      </div>

      {/* PESTAÑAS */}
      <div className="flex border-b border-gray-200 gap-6">
        <button 
          onClick={() => setActiveTab('gestion')}
          className={`pb-3 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'gestion' ? 'border-[#7D2121] text-[#7D2121]' : 'border-transparent text-gray-500'
          }`}
        >
          <FiClock /> En Proceso ({pedidosActivos.length})
        </button>
        <button 
          onClick={() => setActiveTab('historial')}
          className={`pb-3 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'historial' ? 'border-[#7D2121] text-[#7D2121]' : 'border-transparent text-gray-500'
          }`}
        >
          <FiCheckCircle /> Historial ({pedidosHistorial.length})
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
                <th className="px-6 py-4 text-center">Detalles</th>
                {activeTab === 'gestion' && <th className="px-6 py-4">Acción</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10">Cargando...</td></tr>
              ) : listaAMostrar.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">No hay pedidos aquí.</td></tr>
              ) : (
                listaAMostrar.map((pedido) => (
                  <>
                    <tr key={pedido.id} className={`hover:bg-gray-50 transition-colors ${expandedRow === pedido.id ? 'bg-gray-50' : ''}`}>
                      <td className="px-6 py-4 font-bold text-[#7D2121]">#{pedido.id}</td>
                      <td className="px-6 py-4 capitalize flex items-center gap-2">
                        <div className="p-1 bg-gray-100 rounded text-gray-500"><FiUser/></div>
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
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => toggleRow(pedido.id)} className="text-gray-400 hover:text-[#7D2121]">
                          {expandedRow === pedido.id ? <FiChevronUp size={18}/> : <FiChevronDown size={18}/>}
                        </button>
                      </td>
                      {activeTab === 'gestion' && (
                        <td className="px-6 py-4">
                          <select 
                            className="border border-gray-300 rounded p-1 text-xs cursor-pointer outline-none focus:border-[#7D2121]"
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
                    {/* EXPANDIBLE */}
                    {expandedRow === pedido.id && (
                      <tr className="bg-gray-50 animate-fade-in">
                        <td colSpan={7} className="p-4 border-b border-gray-100">
                          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-inner">
                            <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2 text-xs uppercase"><FiPackage/> Productos</h4>
                            <div className="space-y-2">
                                {pedido.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm border-b border-gray-100 last:border-0 pb-1">
                                        <span>{item.cantidad}x {item.nombreProducto}</span>
                                        <span className="font-medium text-[#7D2121]">${item.subtotal.toLocaleString()}</span>
                                    </div>
                                ))}
                                {(!pedido.items || pedido.items.length === 0) && <p className="text-xs text-gray-400">Sin detalles.</p>}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PedidosAdmin;