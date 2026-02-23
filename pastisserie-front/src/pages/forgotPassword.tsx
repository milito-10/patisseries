import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import EmailPreviewModal from '../components/EmailPreviewModal';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [shake, setShake] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [recoveryToken, setRecoveryToken] = useState('');
    const [lastEmailRequested, setLastEmailRequested] = useState('');

    const validate = () => {
        if (!email) {
            toast.error('El correo electrónico es obligatorio');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Por favor, ingresa un formato de correo válido');
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

        setIsLoading(true);
        try {
            const response = await authService.forgotPassword(email);
            if (response.success) {
                setRecoveryToken(response.data?.token || '');
                setLastEmailRequested(email);
                setIsSent(true);
                setShowPreview(true); // Abrir automático en éxito
                toast.success('¡Enlace generado! Revisa la vista previa automática', {
                    icon: '✅',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });
            } else {
                // Si falla el envío real pero tenemos token (fallback de desarrollo)
                if (response.data?.token) {
                    setRecoveryToken(response.data.token);
                    setLastEmailRequested(email);
                    setIsSent(true);
                    setShowPreview(true);
                    toast.error('Error de envío real, pero hemos generado un link de prueba para ti.', { duration: 5000 });
                } else {
                    toast.error(response.message || 'No se pudo enviar el correo');
                }
            }
        } catch (error: any) {
            // Manejo detallado de errores
            if (error.response?.data) {
                const apiRes = error.response.data;

                // Fallback de desarrollo: SMTP falló pero tenemos token
                if (apiRes.data?.token) {
                    setRecoveryToken(apiRes.data.token);
                    setLastEmailRequested(email);
                    setIsSent(true);
                    setShowPreview(true);
                    toast.error(apiRes.message || 'Error de envío real, usando simulación.', { duration: 6000 });
                } else {
                    toast.error(apiRes.message || 'Error en el servidor');
                }
            } else {
                toast.error('Error de conexión con el servidor');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isSent) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex items-center justify-center animate-fade-in px-4">
                <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 text-center relative overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-green-500/10"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="w-24 h-24 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-8 text-5xl shadow-sm border border-green-100 animate-bounce-short">
                        <FiCheckCircle />
                    </div>

                    <h2 className="text-3xl font-serif font-bold text-patisserie-dark mb-4">¡Enlace Enviado!</h2>
                    <p className="text-gray-500 mb-10 leading-relaxed text-sm">
                        Hemos despachado un correo de alta seguridad a <strong className="text-patisserie-dark">{email}</strong>. Debería llegar en menos de 30 segundos.
                    </p>

                    <div className="space-y-4">
                        <Link
                            to="/login"
                            className="w-full inline-flex items-center justify-center gap-3 bg-patisserie-dark text-white py-4 rounded-2xl font-bold hover:bg-patisserie-red transition-all shadow-xl shadow-patisserie-dark/10 uppercase tracking-widest text-xs btn-premium"
                        >
                            <FiArrowLeft /> Volver al Inicio
                        </Link>

                        <div className="pt-4">
                            <button
                                onClick={() => setShowPreview(true)}
                                className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-patisserie-red transition-all bg-gray-50 hover:bg-patisserie-red/5 px-4 py-2 rounded-full border border-gray-100"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-patisserie-red opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-patisserie-red"></span>
                                </span>
                                ¿No recibiste nada? Ver Simulación
                            </button>
                        </div>
                    </div>
                </div>

                <EmailPreviewModal
                    isOpen={showPreview}
                    onClose={() => setShowPreview(false)}
                    email={lastEmailRequested}
                    token={recoveryToken}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 flex items-center justify-center animate-fade-in">
            <div className={`bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 ${shake ? 'animate-shake' : ''}`}>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold mb-2 text-patisserie-dark">Recuperar Acceso</h1>
                    <p className="text-gray-500 text-sm">Ingresa tu correo y te enviaremos un código sencillo para entrar.</p>
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
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-patisserie-red/20 focus:border-patisserie-red transition-all"
                                placeholder="tu@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-patisserie-dark text-white font-bold py-4 rounded-xl hover:bg-patisserie-red transition-all shadow-lg flex justify-center items-center gap-2 uppercase tracking-widest text-xs btn-premium"
                    >
                        {isLoading ? 'Enviando...' : 'Enviar Enlace'}
                    </button>

                    <div className="text-center">
                        <Link to="/login" className="text-sm text-gray-500 hover:text-patisserie-red flex items-center justify-center gap-1 transition-colors">
                            <FiArrowLeft /> Regresar
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
