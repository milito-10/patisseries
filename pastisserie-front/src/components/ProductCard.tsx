import React from 'react';
import { Link } from 'react-router-dom';
import { type Producto } from '../types';
import { useCart } from '../context/CartContext';
import { FiPlus } from 'react-icons/fi';
import { formatCurrency } from '../utils/format';

interface ProductCardProps {
  product: Producto;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden flex flex-col h-full border border-gray-100 group hover:-translate-y-1">

      {/* Imagen (Ahora con Link) */}
      <Link to={`/productos/${product.id}`} className="h-48 overflow-hidden relative block">
        <img
          src={product.imagenUrl || 'https://via.placeholder.com/300x200?text=Sin+Imagen'}
          alt={product.nombre}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 hover-expand"
        />
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <span className="bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-[0.2em] text-patisserie-red shadow-sm border border-patisserie-red/20">
            {product.categoria}
          </span>
          {product.stock === 0 && (
            <span className="bg-red-600 text-white px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-[0.2em] shadow-lg animate-pulse">
              Sin Stock
            </span>
          )}
        </div>
      </Link>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Título (Ahora con Link) */}
        <Link to={`/productos/${product.id}`}>
          <h3 className="font-serif font-bold text-xl mb-1 line-clamp-1 text-patisserie-dark group-hover:text-patisserie-red transition-colors">
            {product.nombre}
          </h3>
        </Link>

        {/* Descripción corta (Opcional, si el diseño lo permite) */}
        {product.descripcion && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.descripcion}</p>
        )}

        <div className="mt-auto pt-3">
          <p className="text-patisserie-red font-bold text-2xl mb-4">
            {formatCurrency(product.precio)}
          </p>

          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product.id);
              // Add a quick success pop effect
              const btn = e.currentTarget;
              btn.classList.add('success-pop');
              setTimeout(() => btn.classList.remove('success-pop'), 400);
            }}
            disabled={product.stock === 0}
            className="w-full bg-patisserie-dark text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-patisserie-red hover:text-white transition-all duration-300 btn-premium disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            {product.stock === 0 ? 'Agotado' : <><FiPlus className="text-lg" /> Agregar</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;