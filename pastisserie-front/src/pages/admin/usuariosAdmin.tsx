import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { FiSearch, FiUser, FiMail, FiShield, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface User {
    id: number;
    nombre: string;
    email: string;
    roles: string[];
    fechaRegistro: string;
    activo: boolean;
}

const UsuariosAdmin = () => {
    const [usuarios, setUsuarios] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const response = await api.get('/auth/users');
            let data = [];
            if (Array.isArray(response.data)) data = response.data;
            else if (response.data?.data && Array.isArray(response.data.data)) data = response.data.data;

            setUsuarios(data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const query = busqueda.toLowerCase().trim().replace('#', '');
    const usuariosFiltrados = usuarios.filter(u => {
        if (!query) return true;
        const nombreMatch = u.nombre?.toLowerCase().includes(query);
        const emailMatch = u.email?.toLowerCase().includes(query);
        const idMatch = u.id.toString().includes(query);
        const roleMatch = u.roles?.some(r => r.toLowerCase().includes(query));
        return nombreMatch || emailMatch || idMatch || roleMatch;
    });

    const toggleUserStatus = async (id: number, currentStatus: boolean) => {
        if (!window.confirm(`¿Estás seguro de que deseas ${currentStatus ? 'desactivar' : 'activar'} este usuario?`)) return;

        try {
            await api.patch(`/users/${id}/status`, !currentStatus, {
                headers: { 'Content-Type': 'application/json' }
            });
            toast.success(`Usuario ${currentStatus ? 'desactivado' : 'activado'} correctamente`);
            fetchUsuarios();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error al actualizar estado');
        }
    };

    // Estados para Modales
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUser, setNewUser] = useState({ nombre: '', email: '', password: '', confirmPassword: '', rol: 'Usuario' });

    // Estado para cambio de rol
    const [editingRoleUser, setEditingRoleUser] = useState<User | null>(null);
    const [newRole, setNewRole] = useState('');

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/users', newUser);
            toast.success('Usuario creado exitosamente');
            setShowCreateModal(false);
            setNewUser({ nombre: '', email: '', password: '', confirmPassword: '', rol: 'Usuario' });
            fetchUsuarios();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error al crear usuario');
        }
    };

    const handleChangeRole = async () => {
        if (!editingRoleUser || !newRole) return;
        try {
            await api.patch(`/users/${editingRoleUser.id}/role`, { NuevoRol: newRole });
            toast.success('Rol actualizado correctamente');
            setEditingRoleUser(null);
            fetchUsuarios();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error al cambiar rol');
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
                    <p className="text-gray-500">Visualiza y administra los usuarios</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-[#7D2121] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#5a1818] transition-colors"
                >
                    <FiUser /> Nuevo Usuario
                </button>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                    <FiSearch className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        className="bg-transparent outline-none text-sm w-full"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-100 text-gray-500 uppercase font-bold text-xs">
                            <tr>
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4">Rol</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Registro</th>
                                <th className="px-6 py-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-8">Cargando usuarios...</td></tr>
                            ) : usuariosFiltrados.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-8">No se encontraron usuarios.</td></tr>
                            ) : usuariosFiltrados.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-red-50 text-[#7D2121] flex items-center justify-center font-bold">
                                                {user.nombre?.substring(0, 2).toUpperCase() || <FiUser />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{user.nombre}</p>
                                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                                    <FiMail /> {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1 flex-wrap">
                                            {user.roles && user.roles.map((rol, idx) => (
                                                <span
                                                    key={idx}
                                                    className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 border cursor-pointer hover:opacity-80
                                                    ${rol === 'Admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}
                                                    onClick={() => { setEditingRoleUser(user); setNewRole(rol); }}
                                                    title="Click para cambiar rol"
                                                >
                                                    <FiShield size={10} /> {rol}
                                                </span>
                                            ))}
                                            {(!user.roles || user.roles.length === 0) && (
                                                <span
                                                    className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200 cursor-pointer"
                                                    onClick={() => { setEditingRoleUser(user); setNewRole('Usuario'); }}
                                                >
                                                    Sin Rol
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {user.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <FiCalendar />
                                            {new Date(user.fechaRegistro).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleUserStatus(user.id, user.activo)}
                                                className={`p-2 rounded transition-colors ${user.activo ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={user.activo ? "Desactivar Usuario" : "Activar Usuario"}
                                            >
                                                <FiShield size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Crear Usuario */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-96 animate-fade-in">
                        <h2 className="text-xl font-bold mb-4 text-[#7D2121]">Crear Nuevo Usuario</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <input
                                type="text" placeholder="Nombre completo" required className="w-full border p-2 rounded"
                                value={newUser.nombre} onChange={e => setNewUser({ ...newUser, nombre: e.target.value })}
                            />
                            <input
                                type="email" placeholder="Email" required className="w-full border p-2 rounded"
                                value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                            />
                            <input
                                type="password" placeholder="Contraseña" required className="w-full border p-2 rounded"
                                value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                            />
                            <input
                                type="password" placeholder="Confirmar Contraseña" required className="w-full border p-2 rounded"
                                value={newUser.confirmPassword} onChange={e => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                            />
                            <select
                                className="w-full border p-2 rounded"
                                value={newUser.rol} onChange={e => setNewUser({ ...newUser, rol: e.target.value })}
                            >
                                <option value="Usuario">Usuario</option>
                                <option value="Admin">Admin</option>
                                <option value="Domiciliario">Domiciliario</option>
                                <option value="Gerente">Gerente</option>
                            </select>

                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-[#7D2121] text-white rounded hover:bg-[#5a1818]">Crear</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Cambiar Rol */}
            {editingRoleUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-80 animate-fade-in">
                        <h2 className="text-lg font-bold mb-4">Cambiar Rol</h2>
                        <p className="text-sm text-gray-500 mb-4">Usuario: {editingRoleUser.nombre}</p>

                        <select
                            className="w-full border p-2 rounded mb-4"
                            value={newRole} onChange={e => setNewRole(e.target.value)}
                        >
                            <option value="Usuario">Usuario</option>
                            <option value="Admin">Admin</option>
                            <option value="Domiciliario">Domiciliario</option>
                            <option value="Gerente">Gerente</option>
                        </select>

                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setEditingRoleUser(null)} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancelar</button>
                            <button type="button" onClick={handleChangeRole} className="px-4 py-2 bg-[#7D2121] text-white rounded hover:bg-[#5a1818]">Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsuariosAdmin;
