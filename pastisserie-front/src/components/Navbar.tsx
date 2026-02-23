import { Link, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  // Calculamos si es admin aquí arriba para no ensuciar el HTML
  const isAdmin = isAuthenticated && (() => {
    if (!user?.rol) return false;
    const rolesAdmin = ['Admin', 'Administrador', 'Administrator'];

    // Si es un array (lista), buscamos si contiene alguno de los roles
    if (Array.isArray(user.rol)) {
      return user.rol.some(r => rolesAdmin.includes(r));
    }

    // Si es texto, comparamos directo
    return rolesAdmin.includes(user.rol as string);
  })();
  // ---------------------------------------

  // Detectar scroll para cambiar de transparente a blanco
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';
  const isTransparent = !scrolled && isHome;

  const navBackground = isTransparent ? 'bg-transparent py-6' : 'bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.05)] py-3';

  const textColor = isTransparent
    ? 'text-white hover:text-patisserie-red'
    : 'text-gray-700 hover:text-patisserie-red';

  const iconColor = isTransparent ? 'text-white' : 'text-gray-700 hover:text-patisserie-red';

  return (
    <nav className={`fixed w-full z-[100] transition-all duration-300 ${navBackground}`}>

      <div className="container mx-auto px-4 flex justify-between items-center">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/icono2.png"
            alt="Patisserie Deluxe"
            className="h-20 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <span className={`text-2xl font-serif font-bold ${isTransparent ? 'text-white' : 'text-patisserie-dark'} hidden`}>
            Patisserie Deluxe
          </span>
        </Link>

        {/* MENÚ DE ESCRITORIO */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className={`${textColor} transition-colors font-medium`}>Inicio</Link>
          <Link to="/productos" className={`${textColor} transition-colors font-medium`}>Catálogo</Link>
          <Link to="/promociones" className={`${textColor} transition-colors font-medium`}>Promociones</Link>
          <Link to="/contacto" className={`${textColor} transition-colors font-medium`}>Contacto</Link>
        </div>

        {/* ICONOS Y USUARIO */}
        <div className="hidden md:flex items-center space-x-6">

          {/* Carrito */}
          <Link to="/carrito" className={`relative transition-colors ${iconColor}`}>
            <FiShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-patisserie-red text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce shadow-sm">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Menú de Usuario */}
          {isAuthenticated ? (
            <div className="group relative py-2">
              <Link to="/perfil" className={`flex items-center gap-2 transition-colors ${iconColor}`}>
                <FiUser size={24} />
                <span className="text-sm font-bold max-w-[100px] truncate hidden lg:block">
                  {user?.nombre}
                </span>
              </Link>

              {/* Puente invisible para mejorar la estabilidad del hover */}
              <div className="absolute h-4 w-full top-full left-0 hidden group-hover:block" />

              {/* Dropdown Flotante */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl py-2 hidden group-hover:block border border-gray-100 overflow-hidden animate-fade-in">

                <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                  <p className="text-xs text-gray-400 font-medium uppercase">Conectado como</p>
                  <p className="font-bold text-gray-800 truncate">{user?.nombre}</p>
                </div>

                {/* ENLACE ADMIN USANDO LA VARIABLE SEGURA */}
                {isAdmin && (
                  <Link to="/admin" className="block px-4 py-3 text-sm text-patisserie-red font-bold hover:bg-red-50 transition-colors border-b border-gray-50">
                    Panel Admin
                  </Link>
                )}

                <Link to="/perfil" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors mt-1">
                  Mi Perfil
                </Link>

                <div className="border-t border-gray-50 mt-2 pt-2">
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <FiLogOut /> Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className={`transition-colors ${iconColor}`} title="Iniciar Sesión">
              <FiUser size={24} />
            </Link>
          )}
        </div>

        {/* BOTÓN MÓVIL */}
        <button onClick={() => setIsOpen(!isOpen)} className={`md:hidden ${iconColor}`}>
          {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
        </button>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 absolute w-full shadow-lg h-screen top-full left-0">
          <div className="flex flex-col p-6 space-y-6 text-center text-lg">
            <Link to="/" onClick={() => setIsOpen(false)} className="text-gray-800 font-medium hover:text-patisserie-red">Inicio</Link>
            <Link to="/productos" onClick={() => setIsOpen(false)} className="text-gray-800 font-medium hover:text-patisserie-red">Catálogo</Link>
            <Link to="/promociones" onClick={() => setIsOpen(false)} className="text-gray-800 font-medium hover:text-patisserie-red">Promociones</Link>
            <Link to="/contacto" onClick={() => setIsOpen(false)} className="text-gray-800 font-medium hover:text-patisserie-red">Contacto</Link>
            <hr className="border-gray-200" />

            <Link to="/carrito" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 text-gray-800 font-medium">
              <FiShoppingCart /> Carrito ({totalItems})
            </Link>

            {isAuthenticated ? (
              <>
                {/* Enlace Admin en Móvil */}
                {isAdmin && (
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="text-patisserie-red font-bold flex items-center justify-center gap-2 border border-red-100 py-2 rounded-lg bg-red-50">
                    ⚡ Panel Admin
                  </Link>
                )}

                <Link to="/perfil" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 text-gray-800 font-bold bg-gray-50 py-3 rounded-lg">
                  <FiUser /> Mi Perfil
                </Link>
                <button onClick={() => { logout(); setIsOpen(false); }} className="flex items-center justify-center gap-2 text-red-500 font-medium">
                  <FiLogOut /> Cerrar Sesión
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="bg-patisserie-red text-white py-3 rounded-lg font-bold shadow-md">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;