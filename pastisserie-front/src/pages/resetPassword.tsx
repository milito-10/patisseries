import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { FiLock, FiCheckCircle, FiShield, FiAlertTriangle, FiX, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingScreen from '../components/LoadingScreen';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email') || '';
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [shake, setShake] = useState(false);

    // Requisitos de Seguridad Dinámicos
    const requirements = [
        { label: 'Mínimo 8 caracteres', test: password.length >= 8 },
        { label: 'Una letra mayúscula', test: /[A-Z]/.test(password) },
        { label: 'Al menos un número', test: /[0-9]/.test(password) },
        { label: 'Las contraseñas coinciden', test: password !== '' && password === confirmPassword },
    ];

    const isStrong = requirements.every(req => req.test);

    useEffect(() => {
        const verifyToken = async () => {
            if (!token || !email) {
                setIsValidToken(false);
                setIsVerifying(false);
                return;
            }

            try {
                const response = await authService.verifyResetToken(email, token);
                setIsValidToken(response.success);
            } catch (error) {
                setIsValidToken(false);
            } finally {
                setIsVerifying(false);
            }
        };

        verifyToken();
    }, [token, email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) return;

        if (!isStrong) {
            toast.error('Por favor, cumple con todos los requisitos de seguridad');
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.resetPassword(email, token, password);
            if (response.success) {
                setIsSuccess(true);
                toast.success('¡Contraseña actualizada con éxito!');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                toast.error(response.message || 'El enlace ha expirado o es inválido');
                setShake(true);
                setTimeout(() => setShake(false), 500);
            }
        } catch (error) {
            toast.error('Error al restablecer la contraseña. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isVerifying) return <LoadingScreen />;

    if (!isValidToken) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex items-center justify-center animate-fade-in px-4">
                <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-red-50 text-center">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl border border-red-100">
                        <FiAlertTriangle />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-patisserie-dark mb-4">Enlace Inválido</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Lo sentimos, el enlace de recuperación ha expirado o no es válido. Por razones de seguridad, los enlaces tienen una duración limitada.
                    </p>
                    <Link
                        to="/forgot-password"
                        className="inline-block w-full bg-patisserie-dark text-white font-bold py-4 rounded-xl hover:bg-patisserie-red transition-all shadow-lg uppercase tracking-widest text-xs btn-premium"
                    >
                        Solicitar Nuevo Enlace
                    </Link>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex items-center justify-center animate-fade-in px-4">
                <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-green-50 text-center">
                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl border border-green-100 animate-bounce-short">
                        <FiCheckCircle />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-patisserie-dark mb-4">¡Todo Listo!</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Tu contraseña ha sido actualizada correctamente. Hemos reforzado la seguridad de tu cuenta. Redirigiendo al inicio de sesión...
                    </p>
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 animate-progress"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 flex items-center justify-center animate-fade-in px-4">
            <div className={`bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 relative overflow-hidden ${shake ? 'animate-shake' : ''}`}>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-patisserie-red/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>

                <div className="text-center mb-8 relative">
                    <div className="w-14 h-14 bg-patisserie-red/10 text-patisserie-red rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl rotate-3">
                        <FiShield />
                    </div>
                    <h1 className="text-3xl font-serif font-bold mb-2 text-patisserie-dark">Nueva Contraseña</h1>
                    <p className="text-gray-500 text-sm">Crea una clave robusta para proteger tus delicias.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Nueva Contraseña</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-patisserie-red transition-colors">
                                    <FiLock />
                                </div>
                                <input
                                    type="password"
                                    className="w-full pl-11 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-patisserie-red/10 focus:border-patisserie-red transition-all bg-gray-50/50 focus:bg-white outline-none"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Confirmar Contraseña</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-patisserie-red transition-colors">
                                    <FiLock />
                                </div>
                                <input
                                    type="password"
                                    className="w-full pl-11 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-patisserie-red/10 focus:border-patisserie-red transition-all bg-gray-50/50 focus:bg-white outline-none"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Security Checklist */}
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Requisitos de Seguridad</p>
                        {requirements.map((req, idx) => (
                            <div key={idx} className={`flex items-center gap-3 text-sm transition-all duration-300 ${req.test ? 'text-green-600' : 'text-gray-400'}`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${req.test ? 'bg-green-100 border-green-200 text-green-600 scale-110' : 'bg-white border-gray-200 text-gray-300'}`}>
                                    {req.test ? <FiCheck size={12} /> : <FiX size={12} />}
                                </div>
                                <span className={req.test ? 'font-medium' : ''}>{req.label}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !isStrong}
                        className="w-full bg-patisserie-dark text-white font-bold py-5 rounded-2xl hover:bg-patisserie-red transition-all shadow-xl shadow-patisserie-dark/10 flex justify-center items-center gap-3 uppercase tracking-widest text-xs btn-premium disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Actualizando...
                            </span>
                        ) : (
                            <>
                                Restaurar Acceso
                                <FiShield className="text-lg group-hover:scale-110 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
