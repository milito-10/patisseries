import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import PaymentSimulator from '../components/PaymentSimulator';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiMapPin, FiPhone, FiTruck, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { formatCurrency } from '../utils/format';

const Checkout = () => {
    const { carrito, totalItems, clearCart } = useCart();
    const navigate = useNavigate();
    const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');

    // Data State
    const [formData, setFormData] = useState({
        direccion: '',
        ciudad: '',
        telefono: '',
        notas: ''
    });
    const [shake, setShake] = useState(false);

    const total = carrito?.total || 0;

    const validate = () => {
        if (!formData.direccion || !formData.ciudad || !formData.telefono) {
            toast.error("Por favor completa todos los campos de envío");
            return false;
        }
        return true;
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Step 1: Validate Shipping & Proceed to Payment
    const handleShippingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }
        setStep('payment');
        window.scrollTo(0, 0);
    };

    // Step 2: Handle Successful Payment from Simulator
    const handlePaymentSuccess = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        const loadingToast = toast.loading("Finalizando tu pedido...");

        try {
            await orderService.createOrder({
                direccion: `${formData.direccion}, ${formData.ciudad}`,
                telefono: formData.telefono,
                metodoPago: 'Tarjeta de Crédito (Simulado)',
                notas: formData.notas
            });

            toast.success("¡Pedido creado exitosamente!", { id: loadingToast });
            setStep('success');
            await clearCart();
            window.scrollTo(0, 0);

        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.message || "Hubo un error al crear el pedido.";
            toast.error(errorMsg, { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (totalItems === 0 && step !== 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-serif text-gray-800 mb-4">Tu carrito está vacío</h2>
                <button onClick={() => navigate('/productos')} className="text-patisserie-red font-bold hover:underline">
                    Volver al catálogo
                </button>
            </div>
        );
    }

    // --- SUCCESS VIEW ---
    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full text-center border-t-8 border-green-500">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <FiCheckCircle size={50} />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800 mb-4">¡Compra Exitosa!</h1>
                    <p className="text-gray-600 mb-8 text-lg">
                        Gracias por tu compra. Hemos recibido tu pedido y pronto comenzaremos a prepararlo con los ingredientes más frescos.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => navigate('/perfil')}
                            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-all"
                        >
                            Ver Mis Pedidos
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-white text-gray-700 border border-gray-200 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all"
                        >
                            Volver al Inicio
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 animate-fade-in">
            <div className="container mx-auto max-w-5xl">

                {/* Header Steps */}
                <div className="mb-10">
                    <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6 text-center">Finalizar Compra</h1>
                    <div className="flex items-center justify-center max-w-xl mx-auto">
                        {/* Step 1 Indicator */}
                        <div className={`flex flex-col items-center z-10 ${step === 'shipping' ? 'text-patisserie-red' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all ${step === 'shipping' ? 'bg-patisserie-red text-white shadow-lg' :
                                step === 'payment' ? 'bg-green-500 text-white' : 'bg-gray-200'
                                }`}>
                                {step === 'payment' ? <FiCheckCircle /> : '1'}
                            </div>
                            <span className="font-bold text-sm">Envío</span>
                        </div>

                        {/* Connector line */}
                        <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${step === 'payment' ? 'bg-green-500' : 'bg-gray-200'}`}></div>

                        {/* Step 2 Indicator */}
                        <div className={`flex flex-col items-center z-10 ${step === 'payment' ? 'text-patisserie-red' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all ${step === 'payment' ? 'bg-patisserie-red text-white shadow-lg' : 'bg-gray-200'}`}>
                                2
                            </div>
                            <span className="font-bold text-sm">Pago</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* MAIN CONTENT AREA */}
                    <div className="lg:col-span-2">

                        {/* STEP 1: SHIPPING FORM */}
                        {step === 'shipping' && (
                            <div className={`bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-slide-in-left ${shake ? 'animate-shake' : ''}`}>
                                <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4">
                                    <FiTruck className="text-patisserie-red" /> Datos de Envío
                                </h2>

                                <form id="shipping-form" onSubmit={handleShippingSubmit} className="space-y-5" noValidate>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Ciudad / Municipio</label>
                                            <input
                                                type="text"
                                                name="ciudad"
                                                placeholder="Ej: Ciudad de México"
                                                className="w-full p-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-patisserie-red/20 focus:border-patisserie-red outline-none transition-all"
                                                value={formData.ciudad}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Teléfono de Contacto</label>
                                            <div className="relative">
                                                <FiPhone className="absolute left-3 top-3.5 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    name="telefono"
                                                    placeholder="Para coordinar la entrega"
                                                    className="w-full pl-10 p-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-patisserie-red/20 focus:border-patisserie-red outline-none transition-all"
                                                    value={formData.telefono}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Dirección de Entrega</label>
                                        <div className="relative">
                                            <FiMapPin className="absolute left-3 top-3.5 text-gray-400" />
                                            <input
                                                type="text"
                                                name="direccion"
                                                placeholder="Calle, Número, Colonia, Referencias..."
                                                className="w-full pl-10 p-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-patisserie-red/20 focus:border-patisserie-red outline-none transition-all"
                                                value={formData.direccion}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>


                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Notas de Entrega (Opcional)</label>
                                        <textarea
                                            name="notas"
                                            placeholder="Instrucciones especiales para el repartidor..."
                                            className="w-full p-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-patisserie-red/20 focus:border-patisserie-red outline-none transition-all resize-none h-24"
                                            value={formData.notas}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            className="bg-gray-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-black transition-all shadow-lg flex items-center gap-2"
                                        >
                                            Continuar al Pago <FiChevronRight />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* STEP 2: PAYMENT SIMULATOR */}
                        {step === 'payment' && (
                            <div className="space-y-6 animate-slide-in-right">

                                {/* Summary of Shipping Data (Editable) */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center text-sm">
                                    <div>
                                        <p className="font-bold text-gray-700">Enviar a:</p>
                                        <p className="text-gray-600">{formData.direccion}, {formData.ciudad}</p>
                                    </div>
                                    <button
                                        onClick={() => setStep('shipping')}
                                        className="text-patisserie-red font-bold hover:underline text-sm"
                                    >
                                        Editar
                                    </button>
                                </div>

                                {/* Payment Component */}
                                <PaymentSimulator
                                    amount={total}
                                    onSuccess={handlePaymentSuccess}
                                    onCancel={() => setStep('shipping')}
                                />

                                <div className="text-center">
                                    <button
                                        onClick={() => setStep('shipping')}
                                        className="text-gray-400 hover:text-gray-600 text-sm font-medium flex items-center justify-center gap-1 mx-auto"
                                    >
                                        <FiChevronLeft /> Volver a datos de envío
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ORDER SUMMARY (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-28">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Resumen del Pedido</h3>

                            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                {carrito?.items.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                            <img
                                                src={item.imagenUrl || 'https://via.placeholder.com/60'}
                                                alt={item.nombreProducto}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-800 line-clamp-2">{item.nombreProducto}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-xs text-gray-500">Cant: {item.cantidad}</span>
                                                <span className="text-sm font-bold text-gray-900">{formatCurrency(item.precioUnitario * item.cantidad)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-4 space-y-3">
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Envío</span>
                                    <span className="text-green-600 font-bold">Gratis</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-200">
                                    <span className="font-bold text-gray-800 text-lg">Total a Pagar</span>
                                    <span className="text-2xl font-bold text-patisserie-red">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Security Badge */}
                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <FiCheckCircle className="text-green-500" />
                            <span>Garantía de Satisfacción 100%</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Checkout;