import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTag, FiClock } from 'react-icons/fi';
import { promocionesService } from '../api/promocionesService';
import type { Promocion } from '../api/promocionesService';
import { formatCurrency } from '../utils/format';

const Promociones = () => {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromociones();
  }, []);

  const fetchPromociones = async () => {
    try {
      const data = await promocionesService.getAll();
      setPromociones(data);
    } catch (error) {
      console.error("Error cargando promociones", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-12 min-h-screen animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold mb-4">Promociones Especiales</h1>
          <p className="text-gray-500">Aprovecha nuestras ofertas y combos por tiempo limitado.</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-red-200 border-t-red-800 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando promociones...</p>
          </div>
        ) : promociones.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 text-lg">No hay promociones activas en este momento.</p>
            <p className="text-gray-400 mt-2">¡Vuelve pronto!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {promociones.map((promo) => (
              <div key={promo.id} className="rounded-2xl p-6 border border-gray-100 flex flex-col sm:flex-row gap-6 items-center shadow-sm hover:shadow-md transition-shadow bg-white hover:bg-red-50/30">
                <img
                  src={promo.imagenUrl || "https://images.unsplash.com/photo-1551024601-bec0273fb832?auto=format&fit=crop&q=80&w=400"}
                  alt={promo.titulo}
                  className="w-full sm:w-40 h-40 object-cover rounded-xl shadow-sm bg-gray-200"
                />

                <div className="flex-grow text-center sm:text-left">
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold mb-2 shadow-sm uppercase tracking-wider">
                    <FiTag className="inline mr-1" /> {promo.tipoDescuento === 'Porcentaje' ? `${promo.valor}% OFF` : 'OFERTA'}
                  </span>

                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{promo.titulo}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{promo.descripcion}</p>

                  <div className="flex items-end justify-center sm:justify-start gap-3 mb-4">
                    {/* Si es porcentaje, mostramos solo el descuento o calculamos si tuviéramos precio base. 
                        Como la promoción es genérica, mostramos el valor si es monto fijo. */}
                    {promo.tipoDescuento === 'MontoFijo' && (
                      <span className="text-3xl font-bold text-patisserie-red">
                        -{formatCurrency(promo.valor)}
                      </span>
                    )}

                  </div>

                  <Link
                    to="/contacto"
                    className="bg-patisserie-dark text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors inline-block"
                  >
                    Lo quiero
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Banner inferior */}
        <div className="mt-16 bg-patisserie-red rounded-2xl p-8 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">¿Tienes un evento especial?</h2>
            <p className="mb-6 opacity-90">Cotiza mesas de dulces y pasteles personalizados con descuento por volumen.</p>
            <Link to="/contacto" className="bg-white text-patisserie-red px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
              <FiClock /> Cotizar Evento
            </Link>
          </div>
          {/* Círculos decorativos de fondo */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl"></div>
        </div>

      </div>
    </div>
  );
};

export default Promociones;