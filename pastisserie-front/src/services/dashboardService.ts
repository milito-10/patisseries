import { type DashboardData } from '../types';

export const dashboardService = {
  getStats: async (): Promise<Omit<DashboardData, 'recentOrders'>> => {
    // Retornamos SOLO las gráficas y KPIs simulados
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          kpis: [
            { label: 'Total de Ventas', value: '$0', change: 'Sin datos', isPositive: true, icon: 'sales' },
            { label: 'Pedidos del Día', value: '0', change: '0%', isPositive: true, icon: 'orders' },
            { label: 'Productos Vendidos', value: '0', change: '0%', isPositive: true, icon: 'products' },
            { label: 'Promociones Activas', value: '3', change: '1 nueva', isPositive: true, icon: 'promos' },
          ],
          salesData: [
            { name: 'Lun', ventas: 0 },
            { name: 'Mar', ventas: 0 },
            { name: 'Mié', ventas: 0 },
            { name: 'Jue', ventas: 0 },
            { name: 'Vie', ventas: 0 },
            { name: 'Sáb', ventas: 0 },
            { name: 'Dom', ventas: 0 },
          ],
          topProducts: [
            { name: 'Croissants', cantidad: 12 },
            { name: 'Pan Artesano', cantidad: 8 },
            { name: 'Pastel Choc.', cantidad: 5 },
            { name: 'Donas', cantidad: 15 },
          ]
        });
      }, 500);
    });
  }
};