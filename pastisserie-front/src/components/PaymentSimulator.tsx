import { useState } from 'react';
import { FiCreditCard, FiLock, FiCheckCircle, FiLoader, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface PaymentSimulatorProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentSimulator = ({ amount, onSuccess, onCancel }: PaymentSimulatorProps) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Format Card Number (groups of 4)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 2) {
      setExpiry(`${value.substring(0, 2)}/${value.substring(2)}`);
    } else {
      setExpiry(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate Processing Delay
    setTimeout(() => {
      // Basic Validation Simulation (Check if card is not empty)
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        toast.error('Número de tarjeta inválido');
        setIsProcessing(false);
        return;
      }

      setIsProcessing(false);
      setIsSuccess(true);

      // Notify parent after success animation
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 2500);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg border border-green-100 animate-fade-in text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-500 animate-bounce">
          <FiCheckCircle size={40} />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Pago Aprobado!</h3>
        <p className="text-gray-500">Tu transacción ha sido procesada correctamente.</p>
        <p className="text-sm text-gray-400 mt-4 animate-pulse">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 w-full max-w-md mx-auto relative overflow-hidden">
      {/* Simulation Banner */}
      <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded-bl-lg border-b border-l border-yellow-200">
        SIMULADOR - NO REAL
      </div>

      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <FiCreditCard className="text-patisserie-red" /> Pago Seguro
        </h3>
        <div className="text-right">
          <span className="text-xs text-gray-400 block uppercase">Total a Pagar</span>
          <span className="text-xl font-bold text-gray-900">${amount.toFixed(2)}</span>
        </div>
      </div>

      <div className="mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center gap-3">
        <FiLock className="text-blue-500" />
        <p className="text-[11px] text-blue-700 leading-tight">
          <strong>Modo Prueba:</strong> Usa cualquier número de 16 dígitos (ej: 4242 4242 4242 4242) y cualquier fecha/CVC para simular.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">


        {/* Card Number */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Número de Tarjeta</label>
          <div className="relative">
            <input
              type="text"
              placeholder="0000 0000 0000 0000"
              className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-patisserie-red/20 focus:border-patisserie-red outline-none transition-all font-mono text-lg tracking-wide placeholder-gray-300"
              value={cardNumber}
              onChange={handleCardNumberChange}
              maxLength={19}
              required
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FiCreditCard size={20} />
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 opacity-60">
              {/* Fake Logos - Simple CSS Shapes */}
              <div className="w-8 h-5 bg-blue-600 rounded-sm" title="Visa"></div>
              <div className="w-8 h-5 bg-orange-500 rounded-sm" title="Mastercard"></div>
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Titular</label>
          <input
            type="text"
            placeholder="NOMBRE COMO APARECE EN LA TARJETA"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-patisserie-red/20 focus:border-patisserie-red outline-none transition-all uppercase placeholder-gray-300"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="flex gap-4">
          {/* Expiry */}
          <div className="w-1/2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vencimiento</label>
            <input
              type="text"
              placeholder="MM/YY"
              maxLength={5}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-patisserie-red/20 focus:border-patisserie-red outline-none transition-all text-center tracking-widest placeholder-gray-300"
              value={expiry}
              onChange={handleExpiryChange}
              required
            />
          </div>

          {/* CVC */}
          <div className="w-1/2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CVC / CVV</label>
            <div className="relative">
              <input
                type="password"
                placeholder="123"
                maxLength={4}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-patisserie-red/20 focus:border-patisserie-red outline-none transition-all text-center tracking-widest placeholder-gray-300"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                required
              />
              <FiLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <button
            type="submit"
            disabled={isProcessing}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg disabled:shadow-none transition-all flex justify-center items-center gap-2 ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black hover:shadow-xl hover:-translate-y-0.5'
              }`}
          >
            {isProcessing ? (
              <>
                <FiLoader className="animate-spin" /> Procesando Pago...
              </>
            ) : (
              `Pagar $${amount.toFixed(2)}`
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full py-2 text-gray-500 font-medium hover:text-red-600 transition-colors text-sm flex items-center justify-center gap-1 group"
          >
            <FiX className="group-hover:rotate-90 transition-transform" /> Cancelar Operación
          </button>
        </div>

        <div className="text-center mt-2 flex items-center justify-center gap-2 opacity-60">
          <FiLock size={12} className="text-green-600" />
          <span className="text-[10px] text-gray-500 font-medium">Encriptación SSL de 256-bits | Pagos Seguros</span>
        </div>
      </form>
    </div>
  );
};

export default PaymentSimulator;
