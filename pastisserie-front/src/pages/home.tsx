import { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import { reviewService, type Review } from '../services/reviewService';
import { type Producto } from '../types';
import { FaStar, FaQuoteLeft, FaLeaf, FaShippingFast, FaAward } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Producto[]>([]);
  const [featuredReviews, setFeaturedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Cargar Productos Destacados
        const prodResponse = await productService.getAll();

        // Robust check for data (handling both wrapped and unwrapped responses)
        const products = prodResponse?.data?.data ||
          prodResponse?.data ||
          prodResponse?.result ||
          prodResponse || [];

        if (Array.isArray(products)) {
          setFeaturedProducts(products.slice(0, 4));
        }

        // 2. Cargar Reseñas
        const reviewsData = await reviewService.getFeatured();
        if (reviewsData && reviewsData.length > 0) {
          setFeaturedReviews(reviewsData.slice(0, 3));
        }

      } catch (error) {
        console.error("Error cargando datos del home", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="animate-fade-in bg-gray-50">
      <Hero />

      {/* --- FEATURES STRIP --- */}
      <section className="bg-white py-16 border-b border-gray-100 shadow-sm relative z-10 mx-auto max-w-6xl rounded-3xl my-20">


        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100 px-8">
          <div className="p-6 group hover:scale-105 transition-transform duration-300 border-none">
            <FaLeaf className="mx-auto text-patisserie-red text-4xl mb-4" />
            <h3 className="font-serif font-bold text-gray-900 mb-2 text-lg">Ingredientes 100% Naturales</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Seleccionamos lo mejor de la tierra para tus postres, sin conservantes ni aditivos.</p>
          </div>
          <div className="p-6 group hover:scale-105 transition-transform duration-300 border-none">
            <FaAward className="mx-auto text-patisserie-red text-4xl mb-4" />
            <h3 className="font-serif font-bold text-gray-900 mb-2 text-lg">Calidad Artesanal</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Cada pieza es una obra de arte, elaborada a mano por nuestros maestros pasteleros.</p>
          </div>
          <div className="p-6 group hover:scale-105 transition-transform duration-300 border-none">
            <FaShippingFast className="mx-auto text-patisserie-red text-4xl mb-4" />
            <h3 className="font-serif font-bold text-gray-900 mb-2 text-lg">Entrega Premium</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Cuidado extremo en la logística para que tu pedido llegue impecable a tu mesa.</p>
          </div>
        </div>
      </section>

      {/* --- PRODUCTOS DESTACADOS --- */}
      <section className="py-24 container mx-auto px-6">

        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <div className="text-left">
            <span className="text-patisserie-red font-bold uppercase tracking-[0.3em] text-xs">Colección Exclusiva</span>
            <h2 className="text-5xl font-serif font-bold text-patisserie-dark mt-2">Nuestras Joyas</h2>
          </div>
          <Link to="/productos" className="group flex items-center gap-2 text-gray-400 hover:text-patisserie-red font-semibold transition-all">
            <span className="border-b border-gray-200 group-hover:border-luxury-gold pb-0.5">Ver catálogo completo</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            // Placeholders if no data
            [1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse bg-gray-200 h-80 rounded-2xl"></div>
            ))
          )}
        </div>
      </section>

      {/* --- HISTORIA (PARALLAX LIKE) --- */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#fcf5eb] -skew-x-12 translate-x-32 hidden lg:block"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            <div className="lg:w-1/2 relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=800" alt="Chef decorando" className="w-full h-full object-cover" />
              </div>
              {/* Decorative Image */}
              <div className="absolute -bottom-10 -left-10 w-2/3 rounded-2xl overflow-hidden shadow-xl border-8 border-white hidden md:block z-20">
                <img src="https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&q=80&w=400" alt="Detalle donas" />
              </div>
            </div>

            <div className="lg:w-1/2">
              <span className="text-patisserie-red font-bold uppercase tracking-[0.3em] text-xs">Nuestra Esencia</span>
              <h2 className="text-5xl font-serif font-bold text-patisserie-dark mt-2 mb-8">Tradición <br /> que se saborea</h2>
              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                Patisserie Deluxe nació en 1995 con un sueño simple: llevar la alta repostería francesa a las mesas locales. Lo que comenzó en una pequeña cocina familiar se ha transformado en un referente de calidad y sabor.
              </p>
              <p className="text-gray-600 mb-10 leading-relaxed text-lg">
                Creemos que un postre no es solo comida, es una experiencia. Por eso, cada tarta, cada macaron y cada pan se elabora a mano cada mañana, respetando los tiempos y las técnicas tradicionales.
              </p>
              <Link to="/contacto" className="inline-block bg-patisserie-dark text-white py-4 px-10 rounded-full hover:bg-patisserie-red hover:text-white transition-all font-bold shadow-xl">
                Conoce más de nosotros
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIOS --- */}
      <section className="py-20 bg-[#f9f9f9]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-patisserie-red font-bold uppercase tracking-[0.3em] text-xs">Testimonios</span>
            <h2 className="text-5xl font-serif font-bold mt-2">La Voz de los Gourmets</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(featuredReviews.length > 0 ? featuredReviews : [
              { id: 101, comentario: "Los pasteles son simplemente increíbles. La calidad y el sabor superan todas mis expectativas.", nombre: "María González", fecha: new Date(), calificacion: 5 },
              { id: 102, comentario: "Perfectos para eventos especiales. Hemos pedido tortas para cumpleaños y siempre quedan espectaculares.", nombre: "Carlos Rodríguez", fecha: new Date(), calificacion: 5 },
              { id: 103, comentario: "Las galletas artesanales son mi debilidad. La textura es imposible de resistir.", nombre: "Ana Silva", fecha: new Date(), calificacion: 5 }
            ]).map((review: any) => (
              <div key={review.id} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 relative group">
                <FaQuoteLeft className="text-4xl text-gray-100 absolute top-6 right-6 group-hover:text-red-50 transition-colors" />

                <div className="flex text-yellow-400 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < review.calificacion ? "text-[#F5B041]" : "text-gray-200"} />
                  ))}
                </div>

                <p className="text-gray-600 text-lg mb-8 italic leading-relaxed relative z-10">"{review.comentario}"</p>

                <div className="flex items-center gap-4 mt-auto border-t border-gray-50 pt-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[#7D2121] font-bold text-lg">
                    {review.nombre ? review.nombre.substring(0, 1) : (review.usuarioNombre ? review.usuarioNombre.substring(0, 1) : 'C')}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{review.nombre || review.usuarioNombre}</p>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Cliente Verificado</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- NEWSLETTER CTA --- */}
      <section className="py-20 bg-gray-900 text-white text-center px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif font-bold mb-4">Únete al Club Deluxe</h2>
          <p className="text-gray-400 mb-8">Recibe ofertas exclusivas y sé el primero en probar nuestras nuevas creaciones.</p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input type="email" placeholder="Tu correo electrónico" className="flex-1 px-6 py-4 rounded-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-patisserie-red/40 focus:border-patisserie-red transition-all" />
            <button type="button" className="px-10 py-4 bg-patisserie-red text-white font-bold rounded-full hover:bg-white hover:text-patisserie-dark transition-all shadow-lg hover:shadow-patisserie-red/20 uppercase tracking-widest text-xs">Suscribirse</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
