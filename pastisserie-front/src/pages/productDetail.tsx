import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FiMinus, FiPlus, FiShoppingBag, FiArrowLeft, FiClock, FiCheck } from 'react-icons/fi';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ProductReviews from '../components/ProductReviews';
import LoadingScreen from '../components/LoadingScreen';
import { formatCurrency } from '../utils/format';
interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  stock: number;
  categoria: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [mainImage, setMainImage] = useState('');

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const response = await api.get(`/productos/${id}`);
        // Manejo robusto de la respuesta (data.data o data directo)
        const data = response.data.data || response.data;
        setProducto(data);
        setMainImage(data.imagenUrl);
      } catch (error) {
        console.error(error);
        toast.error('Error al cargar el producto');
        navigate('/productos');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProducto();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Por favor inicia sesión para comprar');
      navigate('/login');
      return;
    }

    if (producto) {
      await addToCart(producto.id, cantidad);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!producto) return <div className="min-h-screen pt-32 text-center">Producto no encontrado</div>;

  return (
    <div className="min-h-screen bg-white animate-fade-in pt-24 pb-12">
      {/* Botón Volver */}
      <div className="container mx-auto px-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-patisserie-red transition-colors"
        >
          <FiArrowLeft /> Volver al catálogo
        </button>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

          {/* GALERÍA DE IMÁGENES */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-sm relative group">
              <img
                src={mainImage || 'https://via.placeholder.com/600'}
                alt={producto.nombre}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {producto.stock < 5 && producto.stock > 0 && (
                <span className="absolute top-4 right-4 bg-patisserie-red/10 text-patisserie-red px-3 py-1 rounded-full text-xs font-bold border border-patisserie-red/20">
                  ¡Quedan pocos!
                </span>
              )}
            </div>
          </div>

          {/* INFORMACIÓN DEL PRODUCTO */}
          <div className="flex flex-col justify-center">
            <span className="text-sm font-bold text-patisserie-red uppercase tracking-wider mb-2">
              {producto.categoria || 'Pastelería Artesanal'}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight">
              {producto.nombre}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-gray-900">{formatCurrency(producto.precio)}</span>
              {producto.stock > 0 ? (
                <span className="flex items-center gap-1 text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded">
                  <FiCheck size={14} /> Disponible
                </span>
              ) : (
                <span className="text-red-500 text-sm font-medium bg-red-50 px-2 py-1 rounded">Agotado</span>
              )}
            </div>

            <p className="text-gray-600 text-lg leading-relaxed mb-8 border-l-4 border-patisserie-cream pl-4">
              {producto.descripcion}
            </p>

            {/* CONTROLES DE COMPRA */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                {/* Selector de Cantidad */}
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 sm:w-40">
                  <button
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    className="text-gray-400 hover:text-patisserie-red disabled:opacity-50"
                    disabled={cantidad <= 1}
                  >
                    <FiMinus />
                  </button>
                  <span className="font-bold text-lg w-8 text-center">{cantidad}</span>
                  <button
                    onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                    className="text-gray-400 hover:text-patisserie-red disabled:opacity-50"
                    disabled={cantidad >= producto.stock}
                  >
                    <FiPlus />
                  </button>
                </div>

                {/* Botón Agregar */}
                <button
                  onClick={handleAddToCart}
                  disabled={producto.stock === 0}
                  className="flex-1 bg-patisserie-dark text-white hover:bg-patisserie-red transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:bg-gray-300 disabled:cursor-not-allowed py-3 px-6 rounded-xl font-bold uppercase tracking-widest text-sm"
                >
                  <FiShoppingBag size={20} />
                  {producto.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 justify-center">
                <FiClock /> Preparado fresco todos los días
              </div>
            </div>
          </div>
        </div>

        {/* --- SECCIÓN DE RESEÑAS --- */}
        <ProductReviews productId={id} />

      </div>
    </div>
  );
};

export default ProductDetail;