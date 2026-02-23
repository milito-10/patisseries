import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiPhone, FiMapPin, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Perfil = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    telefono: user?.telefono || '',
    direccion: (user as any)?.direccion || '',
  });

  const [shake, setShake] = useState(false);

  const validate = () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return false;
    }
    if (!formData.telefono.trim()) {
      toast.error('El teléfono es obligatorio');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    await updateProfile(formData);
  };

  if (!user) return (
    <div className="min-h-screen pt-32 flex justify-center">
      <p>Inicia sesión para ver tu perfil</p>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 bg-patisserie-cream/30">
      <div className="max-w-2xl mx-auto px-4">
        <div className={`bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 ${shake ? 'animate-shake' : ''}`}>
          {/* Header Perfil */}
          <div className="bg-patisserie-dark h-32 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 bg-patisserie-red rounded-2xl shadow-lg flex items-center justify-center text-white text-4xl font-serif">
                {user.nombre.charAt(0)}
              </div>
            </div>
          </div>

          <div className="pt-16 p-8">
            <h1 className="text-3xl font-serif font-bold text-patisserie-dark">{user.nombre}</h1>
            <p className="text-gray-500 mb-8">{user.email} • <span className="text-patisserie-red font-bold uppercase text-[10px] tracking-widest">{user.rol}</span></p>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nombre Completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FiUser />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-patisserie-red/20 focus:border-patisserie-red outline-none transition-all"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Teléfono</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FiPhone />
                    </div>
                    <input
                      type="tel"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-patisserie-red/20 focus:border-patisserie-red outline-none transition-all"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Dirección de Entrega</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiMapPin />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-patisserie-red/20 focus:border-patisserie-red outline-none transition-all"
                    placeholder="Calle, Ciudad, Código Postal"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-8 bg-patisserie-dark text-white font-bold py-4 rounded-xl hover:bg-patisserie-red transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-xs btn-premium"
              >
                <FiSave className="text-lg" />
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;