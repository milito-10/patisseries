import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingScreen from '../components/LoadingScreen';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shake, setShake] = useState(false);

  // Requisitos de contraseña
  const passwordRequirements = {
    length: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  };

  const calculateStrength = () => {
    let score = 0;
    if (passwordRequirements.length) score++;
    if (passwordRequirements.hasUpper) score++;
    if (passwordRequirements.hasNumber) score++;
    return score;
  };

  const strength = calculateStrength();
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre completo es obligatorio';
    if (!formData.email) newErrors.email = 'El correo electrónico es obligatorio';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'El formato del correo es inválido';

    if (!formData.password) newErrors.password = 'La contraseña es obligatoria';
    else if (!passwordRequirements.length || !passwordRequirements.hasUpper || !passwordRequirements.hasNumber) {
      newErrors.password = 'La contraseña no cumple con los requisitos de seguridad';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(newErrors).length > 0) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const success = await register(formData);
      if (success) {
        navigate('/'); // Redirigir al inicio directamente (auto-login)
      }
    } catch (error) {
      toast.error('Error inesperado durante el registro');
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center animate-fade-in">
      <div className={`bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100 ${shake ? 'animate-shake' : ''}`}>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">Crear Cuenta</h1>
          <p className="text-gray-500 text-sm">Únete a nosotros y disfruta de delicias exclusivas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiUser />
              </div>
              <input
                type="text"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${errors.nombre ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:ring-patisserie-red/20 focus:border-patisserie-red'}`}
                placeholder="Juan Pérez"
                value={formData.nombre}
                onChange={(e) => {
                  setFormData({ ...formData, nombre: e.target.value });
                  if (errors.nombre) setErrors({ ...errors, nombre: '' });
                }}
              />
            </div>
            {errors.nombre && <p className="mt-1 text-xs text-red-500 font-medium">{errors.nombre}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiMail />
              </div>
              <input
                type="email"
                autoComplete="off"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:ring-patisserie-red/20 focus:border-patisserie-red'}`}
                placeholder="juan@ejemplo.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (Opcional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiPhone />
              </div>
              <input
                type="tel"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-patisserie-red/20 focus:border-patisserie-red transition-all"
                placeholder="+1 (555) 000-0000"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiLock />
              </div>
              <input
                type="password"
                autoComplete="new-password"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:ring-patisserie-red/20 focus:border-patisserie-red'}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password}</p>}

            {/* Medidor de Fuerza */}
            <div className="mt-3 space-y-2">
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${strength === 0 ? 'w-0' :
                    strength === 1 ? 'w-1/3 bg-red-500' :
                      strength === 2 ? 'w-2/3 bg-yellow-500' :
                        'w-full bg-green-500'
                    }`}
                />
              </div>

              <div className="grid grid-cols-1 gap-1">
                <RequirementItem met={passwordRequirements.length} text="Mínimo 8 caracteres" />
                <RequirementItem met={passwordRequirements.hasUpper} text="Al menos una mayúscula" />
                <RequirementItem met={passwordRequirements.hasNumber} text="Al menos un número" />
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiLock />
              </div>
              <input
                type="password"
                autoComplete="new-password"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:ring-patisserie-red/20 focus:border-patisserie-red'}`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                }}
              />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-patisserie-dark text-white font-bold py-4 rounded-xl hover:bg-patisserie-red hover:text-white transition-all shadow-lg mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center gap-2 uppercase tracking-widest text-xs btn-premium"
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta? {' '}
          <Link to="/login" className="text-patisserie-red font-bold hover:underline">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${met ? 'bg-green-500' : 'bg-gray-300'}`} />
    <span className={`text-[10px] font-medium transition-colors ${met ? 'text-green-600' : 'text-gray-400'}`}>
      {text}
    </span>
  </div>
);

export default Register;