import { FiMail, FiX, FiExternalLink, FiClock, FiShield } from 'react-icons/fi';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    token: string;
}

const EmailPreviewModal = ({ isOpen, onClose, email, token }: Props) => {
    if (!isOpen) return null;

    const resetLink = `/reset-password?token=${token}&email=${email}`;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#f8f9fa] w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-patisserie-red p-3 rounded-2xl text-white shadow-lg shadow-red-100">
                            <FiMail className="text-xl" />
                        </div>
                        <div>
                            <h3 className="font-serif font-bold text-xl text-gray-800 leading-tight">Bandeja de Entrada</h3>
                            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mt-0.5">Simulación de Seguridad</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all">
                        <FiX size={24} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-grow overflow-y-auto p-6 md:p-12">
                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden max-w-xl mx-auto">

                        {/* Professional Sender Header */}
                        <div className="p-6 md:p-8 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-patisserie-dark flex items-center justify-center text-white font-serif font-bold text-xl shadow-inner">
                                    P
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Pâtisserie Deluxe</h4>
                                    <p className="text-xs text-gray-400 font-medium">no-reply@patisserie-deluxe.com</p>
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 text-gray-400 text-xs font-medium">
                                <FiClock /> <span>Hace un momento</span>
                            </div>
                        </div>

                        {/* Email Body Implementation - Matching Backend */}
                        <div className="p-8 md:p-12 text-center space-y-8">
                            <div className="space-y-4">
                                <h1 className="text-2xl md:text-3xl font-serif font-bold text-patisserie-dark">Recupera tu Acceso</h1>
                                <div className="w-12 h-1 bg-patisserie-red/20 mx-auto rounded-full"></div>
                            </div>

                            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                Hemos recibido una solicitud para restablecer tu contraseña. Si no fuiste tú, puedes ignorar este mensaje con tranquilidad.
                            </p>

                            <div className="py-4">
                                <a
                                    href={resetLink}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onClose();
                                        window.location.href = resetLink;
                                    }}
                                    className="inline-flex items-center gap-3 bg-patisserie-red text-white px-10 py-5 rounded-2xl font-bold shadow-xl shadow-red-100 hover:scale-105 transition-all text-sm uppercase tracking-widest"
                                >
                                    Restablecer Contraseña
                                    <FiExternalLink />
                                </a>
                            </div>

                            <div className="pt-8 space-y-4">
                                <p className="text-[11px] text-gray-400 italic">Este enlace expirará pronto por razones de seguridad.</p>
                                <div className="border-t border-gray-50 pt-6">
                                    <p className="text-[10px] text-gray-300 uppercase tracking-widest leading-relaxed">
                                        Patisserie Deluxe S.A.S • Av. Principal 123 • Bogotá, Colombia<br />
                                        © 2026 Todos los derechos reservados
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-gray-400 text-xs flex items-center justify-center gap-2 italic">
                        <FiShield className="text-patisserie-red/30" />
                        Simulación interactiva habilitada para facilitar el flujo de pruebas.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailPreviewModal;
