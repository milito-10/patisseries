import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ adminOnly = false }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-patisserie-red/20 border-t-patisserie-red rounded-full animate-spin"></div>
        <p className="mt-4 text-patisserie-dark font-medium animate-pulse tracking-widest uppercase text-xs">Verificando Credenciales...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si la ruta es solo para admin, verificamos el rol
  if (adminOnly) {
    const rolesAdmin = ['Admin', 'Administrador', 'Administrator'];
    const userRoles = Array.isArray(user?.rol) ? user.rol : [user?.rol];
    const hasAdminRole = userRoles.some(r => rolesAdmin.includes(r as string));

    if (!hasAdminRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;