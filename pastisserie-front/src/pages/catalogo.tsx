import { useEffect, useState } from 'react';
import { FiFilter, FiSearch } from 'react-icons/fi';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import LoadingScreen from '../components/LoadingScreen';
import { type Producto } from '../types';

const Catalogo = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
    const [busqueda, setBusqueda] = useState('');
    const [ordenarPor, setOrdenarPor] = useState('nombre'); // 'nombre', 'precio-asc', 'precio-desc'
    const [precioRango] = useState<[number, number]>([0, 1000]);

    useEffect(() => {
        fetchProductos();
    }, []);

    const fetchProductos = async () => {
        try {
            const response = await api.get('/productos');
            console.log("📦 API Response Productos:", response.data);

            // Robust check for data
            const rawData = response?.data?.data ||
                response?.data?.result ||
                response?.data || [];

            const data: Producto[] = Array.isArray(rawData) ? rawData : [];

            // A veces el backend devuelve los productos directamente o dentro de un objeto 'success'
            const productosValidos = data.filter(p => p.activo !== false);
            setProductos(productosValidos);

        } catch (error: any) {
            console.error("❌ Error API:", error.response?.data || error.message);
            // toast.error('Error al cargar el catálogo'); // Moved to UI for better UX
            setProductos([]); // Ensure empty state
        } finally {
            setLoading(false);
        }
    };


    const productosFiltrados = productos
        .filter(p => {
            const catP = p.categoria?.trim().toLowerCase() || '';
            const catF = categoriaFiltro.trim().toLowerCase();
            const coincideCategoria = catF === 'todos' || catP === catF;
            const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
            const coincidePrecio = p.precio >= precioRango[0] && p.precio <= precioRango[1];
            return coincideCategoria && coincideBusqueda && coincidePrecio;
        })
        .sort((a, b) => {
            if (ordenarPor === 'precio-asc') return a.precio - b.precio;
            if (ordenarPor === 'precio-desc') return b.precio - a.precio;
            return a.nombre.localeCompare(b.nombre);
        });

    const categorias = ['Todos', ...new Set(productos.map(p => p.categoria).filter(Boolean))];

    if (loading) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-20 animate-fade-in">

            {/* Header Banner */}
            <div className="bg-patisserie-dark text-white py-16 mb-10 pt-28 px-4 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <img src="https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?q=80&w=2070&auto=format&fit=crop" alt="Bakery pattern" className="w-full h-full object-cover" />
                </div>
                <div className="container mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold mb-4 text-white">Nuestro <span className="text-patisserie-red italic">Catálogo</span></h1>
                    <p className="text-gray-300 max-w-2xl mx-auto text-lg font-light tracking-wide">
                        Explora nuestra selección de postres artesanales, hechos con pasión y los mejores ingredientes.
                    </p>
                </div>
            </div>


            <div className="container mx-auto px-6">

                {/* BARRA DE HERRAMIENTAS (Sticky) */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-10 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-24 z-30 border border-gray-100 transition-all hover:shadow-md">

                    {/* Categorías */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                        <FiFilter className="text-gray-400 flex-shrink-0 mr-2" />
                        {categorias.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoriaFiltro(cat)}
                                className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap uppercase tracking-widest ${categoriaFiltro === cat
                                    ? 'bg-patisserie-red text-white shadow-lg scale-105'
                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-patisserie-red border border-gray-100'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Ordenar y Filtros Adicionales */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <select
                            value={ordenarPor}
                            onChange={(e) => setOrdenarPor(e.target.value)}
                            className="bg-gray-50 border border-gray-100 rounded-full px-4 py-2.5 text-xs font-bold text-gray-500 outline-none focus:ring-2 focus:ring-patisserie-red/20 focus:border-patisserie-red transition-all cursor-pointer"
                        >
                            <option value="nombre">Alfabetico (A-Z)</option>
                            <option value="precio-asc">Precio: Menor a Mayor</option>
                            <option value="precio-desc">Precio: Mayor a Menor</option>
                        </select>

                        {/* Buscador */}
                        <div className="relative flex-1 md:w-72">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar postre..."
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-patisserie-red/20 focus:border-patisserie-red transition-all"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* GRID DE PRODUCTOS */}
                {productos.length === 0 && !loading ? (
                    <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm max-w-4xl mx-auto">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiSearch className="text-3xl text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-patisserie-dark mb-2">No pudimos encontrar delicias</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-8">Hubo un problema al conectar con nuestra cocina o no hay productos que coincidan con tu búsqueda.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => { setCategoriaFiltro('Todos'); setBusqueda(''); fetchProductos(); }}
                                className="px-8 py-3 bg-patisserie-dark text-white rounded-full font-bold hover:bg-patisserie-red hover:text-white transition-all uppercase tracking-widest text-xs"
                            >
                                Reintentar conexión
                            </button>
                        </div>
                    </div>
                ) : productosFiltrados.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <p className="text-xl text-gray-500 font-medium mb-4">No encontramos productos con esos criterios 😔</p>
                        <button
                            onClick={() => { setCategoriaFiltro('Todos'); setBusqueda(''); }}
                            className="text-patisserie-red font-bold hover:underline transition-colors uppercase tracking-widest text-sm"
                        >
                            Limpiar filtros y ver todo
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {productosFiltrados.map((producto) => (
                            <ProductCard key={producto.id} product={producto} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Catalogo;