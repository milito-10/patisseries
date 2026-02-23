import { useState, useEffect } from 'react';
import { FiStar, FiUser, FiMessageSquare, FiSend } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Review {
  id: number;
  usuarioNombre: string; // Asegúrate que tu backend devuelva el nombre aquí
  comentario: string;
  calificacion: number;
  fecha: string;
}

const ProductReviews = ({ productId }: { productId: string | undefined }) => {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comentario, setComentario] = useState('');
  const [calificacion, setCalificacion] = useState(5);

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      // Intenta cargar las reseñas
      // Endpoint sugerido: GET /api/productos/{id}/resenas
      const response = await api.get(`/productos/${productId}/resenas`);
      if (Array.isArray(response.data)) {
        setReviews(response.data);
      }
    } catch (error) {
      // Si falla (o el endpoint no existe aún), no rompemos la página, solo mostramos vacío
      console.log("No hay reseñas o error de conexión");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
        toast.error("Debes iniciar sesión para opinar");
        return;
    }
    try {
      // Endpoint sugerido: POST /api/resenas
      await api.post('/resenas', {
        productoId: productId,
        calificacion,
        comentario
      });
      toast.success("¡Gracias por tu opinión!");
      setComentario('');
      setCalificacion(5);
      fetchReviews(); // Recargamos para ver la nueva reseña
    } catch (error) {
      toast.error("Error al publicar la reseña");
    }
  };

  return (
    <div className="mt-16 border-t border-gray-100 pt-10">
      <h3 className="text-2xl font-serif font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FiMessageSquare className="text-patisserie-red" /> 
        Opiniones de Clientes
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* FORMULARIO */}
        <div className="bg-gray-50 p-6 rounded-2xl h-fit border border-gray-100">
            <h4 className="font-bold text-gray-700 mb-4">Deja tu valoración</h4>
            {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">Calificación:</label>
                        <div className="flex gap-1 text-2xl cursor-pointer text-gray-300">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FiStar 
                                    key={star} 
                                    onClick={() => setCalificacion(star)}
                                    className={`transition-colors ${calificacion >= star ? "text-yellow-400 fill-current" : "hover:text-yellow-200"}`}
                                />
                            ))}
                        </div>
                    </div>
                    <textarea 
                        className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-patisserie-red/20 h-24 resize-none bg-white"
                        placeholder="Cuéntanos qué te pareció este producto..."
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        required
                    />
                    <button className="w-full bg-patisserie-red text-white font-bold py-2 rounded-xl hover:bg-red-800 transition-colors flex items-center justify-center gap-2 shadow-md">
                        <FiSend /> Publicar Opinión
                    </button>
                </form>
            ) : (
                <div className="text-center py-6 text-gray-500">
                    <p>Inicia sesión para compartir tu experiencia.</p>
                    <a href="/login" className="text-patisserie-red font-bold hover:underline">Ir al Login</a>
                </div>
            )}
        </div>

        {/* LISTADO DE RESEÑAS */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {reviews.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-gray-400 italic">Este producto aún no tiene reseñas.</p>
                    <p className="text-sm text-gray-400">¡Sé el primero en probarlo!</p>
                </div>
            ) : (
                reviews.map((rev, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-[#EBCfa8] rounded-full flex items-center justify-center text-[#7D2121]">
                                    <FiUser size={14} />
                                </div>
                                <span className="font-bold text-sm text-gray-700">{rev.usuarioNombre || "Cliente"}</span>
                            </div>
                            <div className="flex text-yellow-400 text-xs">
                                {[...Array(5)].map((_, i) => (
                                    <FiStar key={i} className={i < rev.calificacion ? "fill-current" : "text-gray-200"} />
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed mt-2">{rev.comentario}</p>
                        <span className="text-xs text-gray-300 mt-2 block text-right">
                            {new Date(rev.fecha).toLocaleDateString()}
                        </span>
                    </div>
                ))
            )}
        </div>

      </div>
    </div>
  );
};

export default ProductReviews;