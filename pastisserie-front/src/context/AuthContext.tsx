import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User } from '../types';
import { authService, type LoginRequest, type RegisterRequest } from '../services/authService';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- FUNCIÓN AUXILIAR PARA LEER EL TOKEN ---
// Esto abre el token JWT sin necesitar librerías externas
const getRoleFromToken = (token: string): string => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);

    // .NET suele guardar el rol en esta propiedad larga o en "role"
    return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
      || payload["role"]
      || payload["Role"]
      || "Cliente";
  } catch (error) {
    console.error("Error al decodificar token:", error);
    return "Cliente";
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. CARGAR SESIÓN
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          const userData = JSON.parse(storedUser);

          // RE-VERIFICAR ROL DESDE EL TOKEN GUARDADO (Por seguridad)
          const realRole = getRoleFromToken(storedToken);
          userData.rol = realRole;

          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        localStorage.clear();
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // 2. LOGIN ROBUSTO
  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);

      if (response.success && response.data) {
        const responseData = response.data; // Esto es LoginResponse
        const tokenRecibido = responseData.token;

        if (!tokenRecibido) {
          toast.error("Error: Token no recibido.");
          return false;
        }

        // --- MAGIA AQUÍ: EXTRAEMOS EL ROL REAL DEL TOKEN ---
        const rolReal = getRoleFromToken(tokenRecibido);
        console.log("🕵️ ROL DETECTADO EN TOKEN:", rolReal);

        // Guardamos Token
        setToken(tokenRecibido);
        localStorage.setItem('token', tokenRecibido);

        // Creamos objeto usuario con el ROL CORRECTO
        const userData: User = {
          id: responseData.user.id,
          nombre: responseData.user.nombre,
          email: responseData.user.email,
          rol: rolReal,
          emailVerificado: responseData.user.emailVerificado,
          fechaRegistro: responseData.user.fechaRegistro,
          activo: responseData.user.activo
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));

        setIsAuthenticated(true);
        toast.success(`Bienvenido ${rolReal === 'Admin' ? 'Administrador' : ''} ${userData.nombre}`);
        return true;
      } else {
        toast.error(response.message || 'Credenciales incorrectas');
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);

      if (response.success) {
        // AUTOMATIZACIÓN: Intentar login inmediato tras registro
        return await login({ email: data.email, password: data.password });
      } else {
        toast.error(response.message || 'Error al registrarse');
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error('Error en el registro');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return false;

    // Aquí normalmente llamaríamos a authService.updateProfile
    // Por ahora simulamos la persistencia local para la UX del usuario
    try {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Perfil actualizado correctamente');
      return true;
    } catch (error) {
      toast.error('Error al actualizar el perfil');
      return false;
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    toast.success('Sesión cerrada');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};