import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/format';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar = ({ isOpen, onClose }: Props) => {
  const { carrito, removeFromCart, clearCart } = useCart(); // Quitamos cartTotal del destructuring directo para calcularlo aquí
  const navigate = useNavigate();

  // CÁLCULOS EN TIEMPO REAL PARA LA VISTA
  const subtotal = carrito?.items?.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0) || 0;

  const handleCheckout = () => {
    onClose();
    navigate('/carrito');
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside className={`fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">

          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#7D2121] text-white">
            <h2 className="text-xl font-bold font-serif">Tu Pedido 🧁</h2>
            <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">✕</button>
          </div>

          {/* Lista de productos */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {!carrito || carrito.items.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-6xl mb-4">🛒</p>
                <p className="font-medium">Tu carrito está vacío</p>
                <button onClick={onClose} className="mt-4 text-[#7D2121] font-bold hover:underline">
                  Ir a comprar
                </button>
              </div>
            ) : (
              carrito.items.map((item) => (
                <div key={item.id} className="flex gap-4 bg-gray-50 p-4 rounded-xl items-center shadow-sm border border-gray-100">
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-2xl overflow-hidden border border-gray-200">
                    {item.imagenUrl ? (
                      <img src={item.imagenUrl} alt={item.nombreProducto} className="w-full h-full object-cover" />
                    ) : (
                      <span>🍰</span>
                    )}
                  </div>

                  <div className="flex-grow">
                    <h4 className="font-bold text-gray-800 text-sm">{item.nombreProducto}</h4>
                    <p className="text-gray-500 text-xs">Cant: {item.cantidad}</p>
                    <p className="text-[#7D2121] font-bold">{formatCurrency(item.precioUnitario)}</p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-2"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer CON DESGLOSE DE IVA */}
          {carrito && carrito.items.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-gray-500 text-sm">
                  <span>Envío</span>
                  <span className="text-green-600 font-bold">Gratis</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="font-bold text-gray-800">Total a Pagar</span>
                  <span className="text-xl font-bold text-[#7D2121]">{formatCurrency(subtotal)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={clearCart}
                  className="px-4 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-medium text-sm"
                >
                  Vaciar
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex-1 bg-[#7D2121] text-white py-3 rounded-xl font-bold shadow-lg shadow-red-900/20 hover:bg-red-900 transition-all"
                >
                  Pagar
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default CartSidebar;