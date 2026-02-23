import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaWhatsapp } from 'react-icons/fa';
import { useState } from 'react';
import toast from 'react-hot-toast';

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });
  const [shake, setShake] = useState(false);

  const validate = () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('El correo es obligatorio');
      return false;
    }
    if (!formData.mensaje.trim()) {
      toast.error('El mensaje no puede estar vacío');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    // Aquí conectaríamos con un endpoint de contacto si existiera
    toast.success('Mensaje enviado. Te contactaremos pronto.');
    setFormData({ nombre: '', email: '', mensaje: '' });
  };

  return (
    <div className="pt-24 pb-12 animate-fade-in">

      {/* Header Simple */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif font-bold mb-4">Contáctanos</h1>
        <p className="text-gray-500">Estamos aquí para ayudarte. ¡No dudes en contactarnos!</p>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

          {/* Columna Izquierda: Info */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold mb-6">Información de Contacto</h2>

            <div className="flex items-start gap-4">
              <div className="bg-patisserie-red/10 p-3 rounded-full text-patisserie-red">
                <FaMapMarkerAlt size={20} />
              </div>
              <div>
                <h3 className="font-bold">Dirección</h3>
                <p className="text-gray-600">Av. Principal 123, Centro<br />Ciudad, País 12345</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-patisserie-red/10 p-3 rounded-full text-patisserie-red">
                <FaPhone size={20} />
              </div>
              <div>
                <h3 className="font-bold">Teléfono</h3>
                <p className="text-gray-600">+1 (555) 123-4567</p>
                <p className="text-xs text-green-600 font-semibold flex items-center gap-1 mt-1">
                  <FaWhatsapp /> WhatsApp disponible
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-patisserie-red/10 p-3 rounded-full text-patisserie-red">
                <FaEnvelope size={20} />
              </div>
              <div>
                <h3 className="font-bold">Email</h3>
                <p className="text-gray-600">info@patisseriesdeluxe.com</p>
                <p className="text-gray-600">pedidos@patisseriesdeluxe.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-patisserie-red/10 p-3 rounded-full text-patisserie-red">
                <FaClock size={20} />
              </div>
              <div>
                <h3 className="font-bold">Horarios de Atención</h3>
                <p className="text-gray-600 text-sm">
                  Lunes - Viernes: 8:00 AM - 8:00 PM<br />
                  Sábados: 7:00 AM - 8:00 PM<br />
                  Domingos: 7:00 AM - 6:00 PM
                </p>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Formulario */}
          <div className={`bg-white p-8 rounded-xl shadow-sm border border-gray-100 ${shake ? 'animate-shake' : ''}`}>
            <h2 className="text-2xl font-bold mb-6">Envíanos un Mensaje</h2>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-patisserie-red/20 focus:border-patisserie-red outline-none transition-all"
                  placeholder="Tu nombre completo"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-patisserie-red/20 focus:border-patisserie-red outline-none transition-all"
                  placeholder="tucorreo@mail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-patisserie-red/20 focus:border-patisserie-red outline-none transition-all resize-none"
                  placeholder="Escribe tu mensaje aquí..."
                  value={formData.mensaje}
                  onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-patisserie-red text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
              >
                Enviar Mensaje
              </button>
            </form>
          </div>
        </div>

        {/* Sección FAQ */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Preguntas Frecuentes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold mb-2">¿Cuál es el tiempo de entrega?</h3>
              <p className="text-sm text-gray-600">Nuestro tiempo promedio de entrega es de 30-45 minutos, dependiendo de tu ubicación.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold mb-2">¿Hacen entregas los fines de semana?</h3>
              <p className="text-sm text-gray-600">Sí, realizamos entregas todos los días. Los domingos cerramos a las 6:00 PM.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold mb-2">¿Puedo cancelar mi pedido?</h3>
              <p className="text-sm text-gray-600">Puedes cancelar tu pedido hasta 10 minutos después de confirmado, llamando directamente.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold mb-2">¿Tienen productos sin gluten?</h3>
              <p className="text-sm text-gray-600">Sí, tenemos una selección de productos sin gluten. Pregunta por disponibilidad.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacto;