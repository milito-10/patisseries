import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// --- Páginas Públicas ---
import Home from './pages/home';
import Catalogo from './pages/catalogo';
import ProductDetail from './pages/productDetail';
import Promociones from './pages/promociones';
import Contacto from './pages/contacto';
import Login from './pages/login';
import Register from './pages/register';
import Carrito from './pages/carrito';

// --- Páginas Protegidas (Cliente) ---
// ⚠️ IMPORTANTE: Asegúrate de que el nombre del archivo coincida (Checkout.tsx)
import Checkout from './pages/checkout';
import Perfil from './pages/perfil';
import ForgotPassword from './pages/forgotPassword';
import ResetPassword from './pages/resetPassword';

// --- Layouts y Componentes ---
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// --- Páginas de Administración ---
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/dashboard';
import ProductosAdmin from './pages/admin/productosAdmin';
// ⚠️ CAMBIO AQUÍ: Importamos el nuevo componente AdminOrders
import AdminOrders from './pages/admin/adminOrders';
import UsuariosAdmin from './pages/admin/usuariosAdmin';
import PromocionesAdmin from './pages/admin/promocionesAdmin';
import Configuracion from './pages/admin/Configuracion';

function App() {
  return (

    <AuthProvider>
      <CartProvider>
        <Routes>

          {/* =========================================
              RUTAS DE LA TIENDA (CLIENTE)
             ========================================= */}
          <Route path="/" element={<Layout />}>
            {/* Rutas Públicas */}
            <Route index element={<Home />} />
            <Route path="productos" element={<Catalogo />} />
            <Route path="productos/:id" element={<ProductDetail />} />
            <Route path="promociones" element={<Promociones />} />
            <Route path="contacto" element={<Contacto />} />
            <Route path="login" element={<Login />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="registro" element={<Register />} />
            <Route path="carrito" element={<Carrito />} />

            {/* Rutas Protegidas (Requieren Login) */}
            <Route element={<ProtectedRoute />}>
              <Route path="checkout" element={<Checkout />} />
              <Route path="perfil" element={<Perfil />} />
            </Route>
          </Route>

          {/* =========================================
              RUTAS DE ADMINISTRADOR (SEGURAS)
             ========================================= */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="productos" element={<ProductosAdmin />} />
              <Route path="pedidos" element={<AdminOrders />} />
              <Route path="usuarios" element={<UsuariosAdmin />} />
              <Route path="promociones" element={<PromocionesAdmin />} />
              <Route path="configuracion" element={<Configuracion />} />
            </Route>
          </Route>

        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;