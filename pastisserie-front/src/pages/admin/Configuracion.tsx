import React, { useState } from 'react';
import { Save, Lock, User, Store } from 'lucide-react';
import api from '../../api/axios';

const Configuracion: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'perfil' | 'seguridad' | 'tienda'>('perfil');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Estados para cambio de contraseña
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Estados para perfil (simulado por ahora)
    const [profileData, setProfileData] = useState({
        nombre: 'Administrador',
        email: 'admin@pastisserie.com',
        telefono: '555-0123'
    });

    // Estado para la tienda (Real - Backend)
    const [storeData, setStoreData] = useState({
        nombreTienda: '',
        direccion: '',
        telefono: '',
        emailContacto: '',
        costoEnvio: 0,
        moneda: 'COP',
        mensajeBienvenida: ''
    });

    React.useEffect(() => {
        if (activeTab === 'tienda') {
            fetchStoreConfig();
        }
    }, [activeTab]);

    const fetchStoreConfig = async () => {
        try {
            setLoading(true);
            const response = await api.get('/configuracion');
            if (response.data?.data) {
                setStoreData(response.data.data);
            }
        } catch (error) {
            console.error('Error al cargar configuración', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleStoreChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setStoreData({
            ...storeData,
            [name]: name === 'costoEnvio' ? (parseInt(value) || 0) : value
        });
    };

    const submitPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ text: 'Las contraseñas nuevas no coinciden', type: 'error' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ text: 'La contraseña debe tener al menos 6 caracteres', type: 'error' });
            return;
        }

        try {
            setLoading(true);
            // Simulación éxito
            await new Promise(resolve => setTimeout(resolve, 1000));
            setMessage({ text: 'Contraseña actualizada correctamente', type: 'success' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ text: 'Error al actualizar contraseña', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const submitProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 800));
            setMessage({ text: 'Perfil actualizado correctamente', type: 'success' });
        } catch (error) {
            setMessage({ text: 'Error al actualizar perfil', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const submitStore = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.put('/configuracion', storeData);
            setMessage({ text: 'Configuración de tienda guardada', type: 'success' });
        } catch (error) {
            setMessage({ text: 'Error al guardar configuración', type: 'error' });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-playfair font-bold text-gray-800 mb-8">Configuración</h1>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                {/* Sidebar */}
                <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200">
                    <nav className="flex flex-col p-4 space-y-2">
                        <button
                            onClick={() => setActiveTab('perfil')}
                            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'perfil' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            <User size={20} className="mr-3" />
                            Perfil
                        </button>
                        <button
                            onClick={() => setActiveTab('seguridad')}
                            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'seguridad' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            <Lock size={20} className="mr-3" />
                            Seguridad
                        </button>
                        <button
                            onClick={() => setActiveTab('tienda')}
                            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'tienda' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            <Store size={20} className="mr-3" />
                            Tienda
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 p-8">
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-lg flex justify-between items-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            <span>{message.text}</span>
                            <button onClick={() => setMessage({ text: '', type: '' })} className="font-bold">×</button>
                        </div>
                    )}

                    {activeTab === 'perfil' && (
                        <form onSubmit={submitProfile} className="max-w-md animate-fade-in">
                            <h2 className="text-xl font-bold mb-6 text-gray-800">Información de Perfil</h2>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Nombre</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={profileData.nombre}
                                    onChange={handleProfileChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profileData.email}
                                    onChange={handleProfileChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Teléfono</label>
                                <input
                                    type="text"
                                    name="telefono"
                                    value={profileData.telefono}
                                    onChange={handleProfileChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors flex items-center"
                            >
                                <Save size={18} className="mr-2" />
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </form>
                    )}

                    {activeTab === 'seguridad' && (
                        <form onSubmit={submitPassword} className="max-w-md animate-fade-in">
                            <h2 className="text-xl font-bold mb-6 text-gray-800">Cambiar Contraseña</h2>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña Actual</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Confirmar Nueva Contraseña</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors flex items-center"
                            >
                                <Save size={18} className="mr-2" />
                                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                            </button>
                        </form>
                    )}

                    {activeTab === 'tienda' && (
                        <form onSubmit={submitStore} className="max-w-2xl animate-fade-in">
                            <h2 className="text-xl font-bold mb-6 text-gray-800">Configuración de Tienda</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Nombre de la Tienda</label>
                                    <input
                                        type="text"
                                        name="nombreTienda"
                                        value={storeData.nombreTienda}
                                        onChange={handleStoreChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Email de Contacto</label>
                                    <input
                                        type="email"
                                        name="emailContacto"
                                        value={storeData.emailContacto}
                                        onChange={handleStoreChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Dirección Física</label>
                                <input
                                    type="text"
                                    name="direccion"
                                    value={storeData.direccion}
                                    onChange={handleStoreChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Teléfono</label>
                                    <input
                                        type="text"
                                        name="telefono"
                                        value={storeData.telefono}
                                        onChange={handleStoreChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Costo de Envío (COP)</label>
                                    <input
                                        type="number"
                                        name="costoEnvio"
                                        value={storeData.costoEnvio}
                                        onChange={handleStoreChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Mensaje de Bienvenida</label>
                                <textarea
                                    name="mensajeBienvenida"
                                    value={storeData.mensajeBienvenida}
                                    onChange={handleStoreChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors flex items-center"
                            >
                                <Save size={18} className="mr-2" />
                                {loading ? 'Guardando...' : 'Guardar Configuración'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Configuracion;
