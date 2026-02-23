import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import {
    FiGrid, FiBox, FiShoppingBag, FiTag,
    FiUsers, FiSettings, FiLogOut, FiSearch,
    FiMenu, FiX
} from 'react-icons/fi';
import Notificaciones from '../components/common/Notificaciones';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path
        ? "bg-white/10 text-white border-l-4 border-white"
        : "text-white/70 hover:bg-white/5 hover:text-white";

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

            {/* Overlay para móvil */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Color Vino */}
            <aside className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-[#7D2121] text-white flex flex-col shadow-xl transition-transform duration-300 md:relative md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#EBCfa8] p-2 rounded-full text-[#7D2121]">
                            <FiBox size={20} />
                        </div>
                        <div>
                            <h1 className="font-serif font-bold text-lg leading-tight">Patisseries</h1>
                            <p className="text-xs text-white/60">Panel Admin</p>
                        </div>
                    </div>
                    <button className="md:hidden text-white" onClick={() => setIsSidebarOpen(false)}>
                        <FiX size={24} />
                    </button>
                </div>

                <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto">
                    <p className="text-xs text-white/40 uppercase font-bold px-4 mb-2">Menu</p>

                    <Link to="/admin" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin')}`}>
                        <FiGrid /> Dashboard
                    </Link>
                    <Link to="/admin/productos" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin/productos')}`}>
                        <FiBox /> Productos
                    </Link>
                    <Link to="/admin/pedidos" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin/pedidos')}`}>
                        <FiShoppingBag /> Pedidos
                    </Link>
                    <Link to="/admin/promociones" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin/promociones')}`}>
                        <FiTag /> Promociones
                    </Link>
                    <Link to="/admin/usuarios" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin/usuarios')}`}>
                        <FiUsers /> Usuarios
                    </Link>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <Link to="/admin/configuracion" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white rounded-lg mb-2">
                        <FiSettings /> Configuración
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 w-full rounded-lg transition-all text-left">
                        <FiLogOut /> Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto flex flex-col">
                {/* Top Header */}
                <header className="bg-white h-16 shadow-sm flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4 flex-1">
                        <button className="md:hidden text-[#7D2121]" onClick={() => setIsSidebarOpen(true)}>
                            <FiMenu size={24} />
                        </button>

                        {/* Search - Oculto en móviles pequeños */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const search = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
                                if (search.trim()) {
                                    // Navegamos a la lista de pedidos o productos según convenga, 
                                    // aquí por defecto buscaremos en productos por ser lo más común
                                    navigate(`/admin/productos?search=${encodeURIComponent(search)}`);
                                }
                            }}
                            className="relative w-full max-w-md hidden sm:block"
                        >
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                name="search"
                                type="text"
                                placeholder="Buscar productos..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#7D2121]/20"
                            />
                        </form>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <a href="/" className="p-2 text-[#7D2121] bg-red-50 hover:bg-red-100 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap" title="Ver Tienda">
                            Tienda
                        </a>

                        <Notificaciones />

                        <div className="flex items-center gap-3 pl-2 md:pl-4 border-l">
                            <div className="text-right hidden lg:block">
                                <p className="text-sm font-bold text-gray-800">{user?.nombre || 'Administrador'}</p>
                                <p className="text-xs text-gray-500">Admin</p>
                            </div>
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#7D2121] text-white rounded-full flex items-center justify-center font-bold text-sm md:text-base">
                                {user?.nombre?.substring(0, 2).toUpperCase() || 'AD'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-4 md:p-8 flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
