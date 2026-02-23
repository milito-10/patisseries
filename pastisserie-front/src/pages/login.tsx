import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingScreen from '../components/LoadingScreen';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [shake, setShake] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) newErrors.email = 'El correo electrónico es obligatorio';
    else if (!emailRegex.test(email)) newErrors.email = 'El formato del correo es inválido';

    if (!password) newErrors.password = 'La contraseña es obligatoria';
    else if (password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const success = await login({ email, password });
      if (success) {
        navigate('/');
      } else {
        // El login falló (credenciales incorrectas handled in AuthContext but we add shake here)
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (error) {
      toast.error('Error de conexión o problema en el servidor');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center animate-fade-in">
      <div className={`bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100 ${shake ? 'animate-shake' : ''}`}>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">Bienvenido de nuevo</h1>
          <p className="text-gray-500 text-sm">Ingresa a tu cuenta para gestionar tus pedidos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiMail />
              </div>
              <input
                type="email"
                autoComplete="off"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:ring-patisserie-red/20 focus:border-patisserie-red'}`}
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiLock />
              </div>
              <input
                type="password"
                autoComplete="new-password"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:ring-patisserie-red/20 focus:border-patisserie-red'}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password}</p>}
            <div className="text-right mt-2">
              <Link
                to="/forgot-password"
                className="text-xs text-patisserie-red hover:underline font-medium"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-patisserie-dark text-white font-bold py-4 rounded-xl hover:bg-patisserie-red hover:text-white transition-all shadow-lg mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center gap-2 uppercase tracking-widest text-xs btn-premium"
          >
            <FiUser className="text-lg" />
            {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          ¿No tienes una cuenta? {' '}
          <Link to="/registro" className="text-patisserie-red font-bold hover:underline">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;