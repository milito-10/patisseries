import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiTrendingUp, FiShoppingCart, FiBox, FiTag, FiArrowRight
} from 'react-icons/fi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

// Servicios y Tipos
import { orderService } from '../../services/orderService';
import { promocionesService } from '../../services/promocionesService';
import type { Pedido } from '../../types';

const Dashboard = () => {
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Definimos la estructura de las estadísticas
  const [stats, setStats] = useState({
    totalVentas: 0,
    totalPedidos: 0,
    productosVendidos: 0,
    promocionesActivas: 0,
    chartData: [] as { name: string; ventas: number }[],
    topProducts: [] as { name: string; cantidad: number }[]
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Cargar datos en paralelo
        const [allOrders, promosResponse] = await Promise.all([
          orderService.getAllOrders() as Promise<Pedido[]>,
          promocionesService.getAll()
        ]);

        console.log("Datos del Dashboard:", allOrders);

        // ---------------------------------------------------
        // 1. FILTRO: VENTAS REALES (Solo Entregados)
        // ---------------------------------------------------
        const ordenesEntregadas = (allOrders as Pedido[]).filter((o: Pedido) => o.estado === 'Entregado');
        const totalMoney = ordenesEntregadas.reduce((sum: number, order: Pedido) => sum + (order.total || 0), 0);
        const countOrders = (allOrders as Pedido[]).length;
        const ordersToCountProducts = (allOrders as Pedido[]).filter((o: Pedido) => o.estado !== 'Cancelado');

        const countProducts = ordersToCountProducts.reduce((acc: number, order: Pedido) => {
          const itemsCount = order.items?.reduce((sum: number, item: any) => sum + item.cantidad, 0) || 0;
          return acc + itemsCount;
        }, 0);

        // Contar promociones activas hoy
        const now = new Date();
        const activePromos = promosResponse.success && Array.isArray(promosResponse.data)
          ? (promosResponse.data as any[]).filter((p: any) => p.activo && new Date(p.fechaFin) > now).length
          : 0;

        // ---------------------------------------------------
        // 2. GRÁFICA DE LÍNEAS (Ventas por día de la semana)
        // ---------------------------------------------------
        const daysMap: { [key: string]: number } = {
          'Lun': 0, 'Mar': 0, 'Mié': 0, 'Jue': 0, 'Vie': 0, 'Sáb': 0, 'Dom': 0
        };

        (allOrders as Pedido[]).filter((o: Pedido) => o.estado !== 'Cancelado').forEach((order: Pedido) => {
          if (!order.fechaPedido) return;
          const date = new Date(order.fechaPedido);
          if (isNaN(date.getTime())) return;

          const dayIndex = date.getDay(); // 0 = Domingo
          const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
          const dayName = dayNames[dayIndex];

          if (daysMap[dayName] !== undefined) {
            daysMap[dayName] += order.total;
          }
        });

        const salesChartData = [
          { name: 'Lun', ventas: daysMap['Lun'] },
          { name: 'Mar', ventas: daysMap['Mar'] },
          { name: 'Mié', ventas: daysMap['Mié'] },
          { name: 'Jue', ventas: daysMap['Jue'] },
          { name: 'Vie', ventas: daysMap['Vie'] },
          { name: 'Sáb', ventas: daysMap['Sáb'] },
          { name: 'Dom', ventas: daysMap['Dom'] },
        ];

        // ---------------------------------------------------
        // 3. GRÁFICA DE BARRAS (Top Productos)
        // ---------------------------------------------------
        const productCountMap: { [key: string]: number } = {};

        ordersToCountProducts.forEach((order: Pedido) => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
              const name = item.nombreProducto || "Producto";
              productCountMap[name] = (productCountMap[name] || 0) + item.cantidad;
            });
          }
        });

        const topProductsReal = Object.entries(productCountMap)
          .map(([name, cantidad]) => ({ name, cantidad }))
          .sort((a, b) => b.cantidad - a.cantidad)
          .slice(0, 5);

        const sortedOrders = (allOrders as Pedido[]).sort((a: Pedido, b: Pedido) => b.id - a.id);

        setOrders(sortedOrders);
        setStats({
          totalVentas: totalMoney,
          totalPedidos: countOrders,
          productosVendidos: countProducts,
          promocionesActivas: activePromos,
          chartData: salesChartData,
          topProducts: topProductsReal
        });

        // Solo mostrar carga completa la primera vez
        if (loading) setLoading(false);

      } catch (error) {
        console.error("Error cargando dashboard:", error);
        if (loading) setLoading(false);
      }
    };

    // Carga inicial
    loadData();

    // Configurar Polling cada 30 segundos para actualización "en vivo"
    const interval = setInterval(() => {
      console.log("Refrescando datos del dashboard...");
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, []); // El array vacío es correcto, el polling maneja las actualizaciones

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Entregado': return 'bg-green-100 text-green-700';
      case 'En preparación': return 'bg-yellow-100 text-yellow-700';
      case 'Pendiente': return 'bg-red-100 text-red-700';
      case 'Enviado': return 'bg-blue-100 text-blue-700';
      case 'Cancelado': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getClientName = (pedido: Pedido) => {
    if (pedido.usuario?.nombre) return pedido.usuario.nombre;
    if (pedido.nombreUsuario) return pedido.nombreUsuario;
    if (pedido.usuario?.email) return pedido.usuario.email.split('@')[0];
    return 'Cliente Web';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-patisserie-red"></div>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm">Resumen general de tu panadería</p>
        </div>
        <div className="text-xs text-gray-400 font-medium">
          Última actualización: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">

        {/* Ventas Totales (Proyeccion) */}
        <div
          onClick={() => navigate('/admin/pedidos')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start cursor-pointer hover:shadow-md transition-all group"
        >
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Ventas Proyectadas</p>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">${stats.chartData.reduce((s, d) => s + d.ventas, 0).toLocaleString()}</h3>
            <span className="text-xs font-semibold text-orange-500 group-hover:text-patisserie-red transition-colors flex items-center gap-1">
              Ver detalle <FiArrowRight />
            </span>
          </div>
          <div className="p-3 rounded-xl bg-red-900 text-white shadow-md shadow-red-900/20 group-hover:scale-110 transition-transform">
            <FiTrendingUp size={20} />
          </div>
        </div>

        {/* Pedidos Pendientes */}
        <div
          onClick={() => navigate('/admin/pedidos?filter=pendiente')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start cursor-pointer hover:shadow-md transition-all group"
        >
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Pedidos Pendientes</p>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{orders.filter(o => o.estado === 'Pendiente' || o.estado === 'En preparación').length}</h3>
            <span className="text-xs font-semibold text-yellow-600 group-hover:text-yellow-700 transition-colors flex items-center gap-1">
              Gestionar <FiArrowRight />
            </span>
          </div>
          <div className="p-3 rounded-xl bg-yellow-100 text-yellow-700 group-hover:rotate-12 transition-transform">
            <FiShoppingCart size={20} />
          </div>
        </div>

        {/* Total Pedidos (Histórico) */}
        <div
          onClick={() => navigate('/admin/pedidos')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start cursor-pointer hover:shadow-md transition-all group"
        >
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Pedidos</p>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.totalPedidos}</h3>
            <span className="text-xs font-semibold text-blue-500">Historial completo</span>
          </div>
          <div className="p-3 rounded-xl bg-[#EBCfa8] text-[#7D2121]">
            <FiShoppingCart size={20} />
          </div>
        </div>

        {/* Productos Vendidos */}
        <div
          onClick={() => navigate('/admin/productos')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start cursor-pointer hover:shadow-md transition-all group"
        >
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Inventario</p>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.productosVendidos}</h3>
            <span className="text-xs font-semibold text-orange-500">Items mover stock</span>
          </div>
          <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
            <FiBox size={20} />
          </div>
        </div>

        {/* Promociones */}
        <div
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start cursor-pointer hover:shadow-md transition-all group"
          onClick={() => navigate('/admin/promociones')}
        >
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Promociones</p>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.promocionesActivas}</h3>
            <span className="text-xs font-semibold text-green-500">Vigentes hoy</span>
          </div>
          <div className="p-3 rounded-xl bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
            <FiTag size={20} />
          </div>
        </div>
      </div>

      {/* GRÁFICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gráfica Ventas Semanales */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[350px] flex flex-col">
          <h3 className="font-bold text-gray-800 mb-4 uppercase tracking-tighter text-xs text-gray-400">Ventas Semanales (Proyectadas)</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7D2121" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#7D2121" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <RechartsTooltip
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Ventas']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontFamily: 'Inter, sans-serif' }}
                />
                <Area type="monotone" dataKey="ventas" stroke="#7D2121" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" dot={{ r: 4, fill: "#7D2121", strokeWidth: 2, stroke: "#fff" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica Top Productos */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[350px] flex flex-col">
          <h3 className="font-bold text-gray-800 mb-4 uppercase tracking-tighter text-xs text-gray-400">Productos Más Vendidos</h3>
          <div className="flex-1 w-full min-h-0">
            {stats.topProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <div className="text-center">
                  <FiBox className="mx-auto mb-2 text-gray-300" size={24} />
                  <p>No hay datos suficientes aún</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topProducts} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} dy={10} interval={0} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} />
                  <RechartsTooltip cursor={{ fill: '#f9fafb', radius: 8 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="cantidad" fill="#7D2121" radius={[6, 6, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* TABLA DE PEDIDOS RECIENTES */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Últimos Pedidos</h3>
          <button
            onClick={() => navigate('/admin/pedidos')}
            className="text-xs font-bold text-patisserie-red hover:underline flex items-center gap-1"
          >
            Ver todos <FiArrowRight />
          </button>
        </div>

        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <p>No hay pedidos registrados aún.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="p-4 pl-6 font-semibold">ID</th>
                  <th className="p-4 font-semibold">Cliente</th>
                  <th className="p-4 font-semibold">Fecha</th>
                  <th className="p-4 font-semibold">Total</th>
                  <th className="p-4 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.slice(0, 5).map(pedido => (
                  <tr
                    key={pedido.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/admin/pedidos?id=${pedido.id}`)}
                  >
                    <td className="p-4 pl-6 font-bold text-[#7D2121]">#{pedido.id}</td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800 capitalize group-hover:text-patisserie-red transition-colors">
                        {getClientName(pedido)}
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">
                      {new Date(pedido.fechaPedido).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-gray-800">${pedido.total.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${getStatusColor(pedido.estado)}`}>
                        {pedido.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
