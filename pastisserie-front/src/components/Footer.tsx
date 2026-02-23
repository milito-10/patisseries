import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-patisserie-dark text-white pt-20 pb-10 border-t border-patisserie-red/20">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">

        <div>
          <h3 className="font-serif font-bold text-xl mb-6 text-patisserie-red">Información de Contacto</h3>
          <ul className="space-y-3 text-sm opacity-90">
            <li className="flex items-start gap-2">
              <span>📍</span>
              <span>Av. Principal 123, Centro<br />Ciudad, País</span>
            </li>
            <li className="flex items-center gap-2">
              <span>📞</span>
              <span>+1 (555) 123-4567</span>
            </li>
            <li className="flex items-start gap-2">
              <span>🕒</span>
              <span>
                Lun - Vie: 8:00 AM - 8:00 PM<br />
                Sáb - Dom: 7:00 AM - 6:00 PM
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-serif font-bold text-xl mb-6 text-patisserie-red">Sobre Patisseries Deluxe</h3>
          <p className="text-sm opacity-90 leading-relaxed">
            Desde 1995, creamos con pasión productos artesanales únicos.
            Utilizamos ingredientes premium y técnicas francesas tradicionales
            para crear pasteles, postres y galletas que deleitan tus sentidos.
          </p>
        </div>

        <div>
          <h3 className="font-serif font-bold text-xl mb-6 text-patisserie-red">Síguenos</h3>
          <div className="flex space-x-4 mb-4">
            <a href="#" className="bg-white/5 border border-white/10 p-3 rounded-full hover:bg-patisserie-red hover:text-white transition-all">
              <FaFacebookF />
            </a>
            <a href="#" className="bg-white/5 border border-white/10 p-3 rounded-full hover:bg-patisserie-red hover:text-white transition-all">
              <FaInstagram />
            </a>
            <a href="#" className="bg-white/5 border border-white/10 p-3 rounded-full hover:bg-patisserie-red hover:text-white transition-all">
              <FaWhatsapp />
            </a>
          </div>
          <p className="text-xs opacity-75">¡Comparte tus fotos usando #PatisseriesDeluxe!</p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 pt-6 border-t border-white/20 text-center text-xs opacity-75">
        <p>&copy; {new Date().getFullYear()} Patisseries Deluxe. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;