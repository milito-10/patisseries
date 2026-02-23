import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative h-[85vh] min-h-[700px] w-full bg-patisserie-dark overflow-hidden flex items-start justify-center pt-32 md:pt-40">
      {/* Background Image with Deep Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=2070&auto=format&fit=crop"
          alt="Luxury Bakery Header"
          className="w-full h-full object-cover animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-patisserie-dark via-patisserie-dark/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-patisserie-dark via-transparent to-transparent opacity-60"></div>
      </div>

      {/* Decorative Golden Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-luxury-gold to-transparent opacity-50"></div>

      {/* Content Container */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl animate-fade-in-up">
          {/* Tagline */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-[2px] bg-patisserie-red animate-fade-in-up"></div>
          </div>
          <h2 className="text-patisserie-red font-serif text-lg md:text-xl font-bold tracking-[0.4em] uppercase mb-4 animate-fade-in-up">
            Artesanos desde <span className="italic">1995</span>
          </h2>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-serif font-bold text-white mb-8 leading-tight animate-fade-in-up delay-100">
            Arte en Alta <br />
            <span className="text-patisserie-red italic">Repostería</span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-white/90 font-light mb-12 max-w-2xl leading-relaxed animate-fade-in-up delay-200">
            Pastelería francesa artesanal con ingredientes premium y el toque secreto de nuestra <span className="text-white italic font-bold">maison</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 animate-fade-in-up delay-300 relative z-20">
            <Link
              to="/productos"
              className="px-10 py-4 bg-patisserie-red text-white rounded-full font-bold hover:bg-white hover:text-patisserie-red transition-all shadow-xl hover:shadow-patisserie-red/20 text-center uppercase tracking-widest text-sm btn-premium btn-pulse"
            >
              Ver Catálogo
            </Link>
            <Link
              to="/contacto"
              className="px-10 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-patisserie-dark transition-all text-center uppercase tracking-widest text-sm"
            >
              Visítanos Ahora
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Gradient Bottom */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-patisserie-dark to-transparent pointer-events-none"></div>

      {/* Scroll indicator with Red touch */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-patisserie-red/40 flex flex-col items-center gap-3 animate-bounce hidden md:flex">
        <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Explorar</span>
        <div className="w-[1px] h-10 bg-gradient-to-b from-patisserie-red/60 to-transparent"></div>
      </div>
    </div>
  );
};

export default Hero;