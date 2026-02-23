// src/types/index.ts

// 1. Interfaces (sin cambios)
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  errors?: string[];
}

// 2. ENUMS REEMPLAZADOS POR CONSTANTES (Solución al error erasableSyntaxOnly)
// Usamos 'as const' para que TypeScript sepa que los valores no cambiarán
export const EstadoEnvio = {
  Pendiente: "Pendiente",
  Asignado: "Asignado",
  EnCamino: "EnCamino",
  Entregado: "Entregado",
  Fallido: "Fallido",
  Devuelto: "Devuelto"
} as const;

// Esto crea un tipo para usarlo como: let estado: EstadoEnvio
export type EstadoEnvio = typeof EstadoEnvio[keyof typeof EstadoEnvio];

export const EstadoPedido = {
  Pendiente: "Pendiente",
  Confirmado: "Confirmado",
  EnPreparacion: "EnPreparacion",
  Listo: "Listo",
  EnCamino: "EnCamino",
  Entregado: "Entregado",
  Cancelado: "Cancelado"
} as const;

export type EstadoPedido = typeof EstadoPedido[keyof typeof EstadoPedido];

// 3. RESTO DE INTERFACES (sin cambios)
export interface User {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  emailVerificado: boolean;
  fechaRegistro: string;
  activo: boolean;
  rol?: string | string[];
}

export interface LoginResponse {
  token: string;
  expiration: string;
  user: User;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  stockMinimo?: number;
  categoria: string;
  categoriaId: number; // El ID de la categoría (para guardar/editar)
  imagenUrl?: string;
  esPersonalizable: boolean;
  activo: boolean;
  promedioCalificacion: number;
  totalReviews: number;
}

export interface CarritoItem {
  id: number;
  productoId: number;
  nombreProducto: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  imagenUrl?: string;
}

export interface Carrito {
  id: number;
  usuarioId: number;
  items: CarritoItem[];
  total: number;
  totalItems: number;
}

export interface DireccionEnvio {
  id: number;
  nombreCompleto: string;
  direccion: string;
  barrio?: string;
  referencia?: string;
  telefono: string;
  esPredeterminada: boolean;
}

export interface PedidoItem {
  id: number;
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  usuarioId: number;
  nombreUsuario: string;
  usuario?: {
    nombre: string;
    email: string;
    telefono?: string;
  };
  fechaPedido: string;
  estado: string; // O puedes usar: EstadoPedido
  subtotal: number;
  iva: number;
  costoEnvio: number;
  total: number;
  esPersonalizado: boolean;
  aprobado: boolean;
  fechaEntregaEstimada?: string;
  items: PedidoItem[];
  direccionEnvio?: DireccionEnvio;

}
// src/types/index.ts

export interface DashboardKPI {
  label: string;
  value: string | number;
  change: string; // Ej: "+12.5%"
  isPositive: boolean;
  icon: 'sales' | 'orders' | 'products' | 'promos';
}

export interface ChartDataSales {
  name: string; // Ej: "Lun"
  ventas: number;
}

export interface ChartDataProducts {
  name: string; // Ej: "Croissants"
  cantidad: number;
}

export interface DashboardData {
  kpis: DashboardKPI[];
  salesData: ChartDataSales[];
  topProducts: ChartDataProducts[];
  recentOrders: Pedido[]; // Reutilizamos tu tipo Pedido existente
}