import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiX, FiSave, FiImage, FiSettings, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { categoriasService } from '../../api/categoriasService';
import type { Categoria } from '../../api/categoriasService';
import CategoriasModal from '../../components/admin/CategoriasModal';
import { formatCurrency } from '../../utils/format';

// Interfaz del Producto
interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  imagenUrl: string;
  activo: boolean;
}

// Estado inicial del formulario
const initialFormState = {
  nombre: '',
  descripcion: '',
  precio: 0,
  stock: 0,
  categoria: '',
  imagenUrl: '',
  activo: true
};

const ProductosAdmin = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroStock, setFiltroStock] = useState<'todos' | 'bajo' | 'agotado'>('todos');
  const [ordenarPor, setOrdenarPor] = useState<'nombre' | 'precio' | 'stock'>('nombre');
  const [ordenDireccion, setOrdenDireccion] = useState<'asc' | 'desc'>('asc');

  // Estados del Modal
  const [showModal, setShowModal] = useState(false);
  const [showCategoriasModal, setShowCategoriasModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{ nombre?: string; precio?: string; stock?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // DRAG & DROP STATES
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadImage(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadImage(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const response = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data && response.data.data && response.data.data.url) {
        setFormData(prev => ({ ...prev, imagenUrl: response.data.data.url }));
        toast.success('Imagen subida correctamente');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const location = useLocation();

  useEffect(() => {
    fetchProductos();
    fetchCategorias();

    // Capturar búsqueda desde la URL (AdminLayout)
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setBusqueda(searchParam);
    }
  }, [location.search]);

  const fetchCategorias = async () => {
    try {
      const response = await categoriasService.getAll();
      if (response.success && Array.isArray(response.data)) {
        setCategorias(response.data);
      }
    } catch (error) {
      console.error("Error cargando categorías");
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await api.get('/productos');
      let data = [];
      if (Array.isArray(response.data)) data = response.data;
      else if (response.data?.data && Array.isArray(response.data.data)) data = response.data.data;

      setProductos(data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  // --- MANEJADORES DEL FORMULARIO ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Manejo especial para checkboxes y números
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked :
      type === 'number' ? Number(value) : value;

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const openNewModal = () => {
    setFormData(initialFormState);
    setErrors({});
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (producto: Producto) => {
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      stock: producto.stock,
      categoria: producto.categoria || '',
      imagenUrl: producto.imagenUrl || '',
      activo: producto.activo
    });
    setErrors({});
    setCurrentId(producto.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const validate = () => {
    const newErrors: { nombre?: string; precio?: string; stock?: string } = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (formData.precio <= 0) newErrors.precio = 'El precio debe ser mayor a 0';
    if (formData.stock < 0) newErrors.stock = 'El stock no puede ser negativo';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      if (isEditing && currentId) {
        // ACTUALIZAR (PUT)
        await api.put(`/productos/${currentId}`, { ...formData, id: currentId });
        toast.success('Producto actualizado correctamente');
      } else {
        // CREAR (POST)
        await api.post('/productos', formData);
        toast.success('Producto creado exitosamente');
      }
      setShowModal(false);
      fetchProductos(); // Recargar tabla
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar el producto');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      toast.success('Producto eliminado');
      fetchProductos();
    } catch (error) {
      toast.error('No se pudo eliminar');
    }
  };

  const listaSegura = Array.isArray(productos) ? productos : [];

  // 1. FILTRADO
  const productosFiltrados = listaSegura.filter(p => {
    // A) Búsqueda por texto (ID, nombre, etc)
    const query = busqueda.toLowerCase().trim();
    const matchesBusqueda = !query ||
      (p.nombre?.toLowerCase() || '').includes(query) ||
      (p.categoria?.toLowerCase() || '').includes(query) ||
      (p.descripcion?.toLowerCase() || '').includes(query) ||
      p.id.toString() === query || `#${p.id}` === query || p.id.toString().includes(query);

    // B) Filtro por Categoría
    const matchesCategoria = !filtroCategoria || p.categoria === filtroCategoria;

    // C) Filtro por Stock
    let matchesStock = true;
    if (filtroStock === 'bajo') matchesStock = p.stock > 0 && p.stock < 5;
    else if (filtroStock === 'agotado') matchesStock = p.stock <= 0;

    return matchesBusqueda && matchesCategoria && matchesStock;
  });

  // 2. ORDENADO
  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    let valA: any = a[ordenarPor];
    let valB: any = b[ordenarPor];

    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return ordenDireccion === 'asc' ? -1 : 1;
    if (valA > valB) return ordenDireccion === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleOrden = (key: 'nombre' | 'precio' | 'stock') => {
    if (ordenarPor === key) {
      setOrdenDireccion(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenarPor(key);
      setOrdenDireccion('asc');
    }
  };

  return (
    <div className="animate-fade-in p-2">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Productos</h1>
          <p className="text-gray-500">Crea, edita y administra tu inventario</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCategoriasModal(true)}
            className="bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FiSettings className="text-gray-400" /> Categorías
          </button>
          <button
            onClick={openNewModal}
            className="bg-[#7D2121] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-red-900 transition-colors shadow-md"
          >
            <FiPlus /> Nuevo Producto
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-4 bg-gray-50/50">
          {/* Búsqueda */}
          <div className="flex-1 min-w-[200px] relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID, nombre o categoría..."
              className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#7D2121]/20 transition-all"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Filtro Categoría */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Categoría:</span>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#7D2121]/20"
            >
              <option value="">Todas</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
              ))}
            </select>
          </div>

          {/* Filtro Stock */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Estado:</span>
            <select
              value={filtroStock}
              onChange={(e) => setFiltroStock(e.target.value as any)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#7D2121]/20"
            >
              <option value="todos">Todos</option>
              <option value="bajo">Stock Bajo {'<'} 5</option>
              <option value="agotado">Agotados</option>
            </select>
          </div>

          {/* Limpiar Filtros */}
          {(busqueda || filtroCategoria || filtroStock !== 'todos') && (
            <button
              onClick={() => { setBusqueda(''); setFiltroCategoria(''); setFiltroStock('todos'); }}
              className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <FiX /> Limpiar
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-gray-500 uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-4">Imagen</th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors group"
                  onClick={() => toggleOrden('nombre')}
                >
                  <div className="flex items-center gap-2">
                    Nombre
                    <span className={`text-[10px] ${ordenarPor === 'nombre' ? 'text-[#7D2121]' : 'text-gray-300 opacity-0 group-hover:opacity-100'}`}>
                      {ordenDireccion === 'asc' ? '▲' : '▼'}
                    </span>
                  </div>
                </th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors group"
                  onClick={() => toggleOrden('precio')}
                >
                  <div className="flex items-center gap-2">
                    Precio
                    <span className={`text-[10px] ${ordenarPor === 'precio' ? 'text-[#7D2121]' : 'text-gray-300 opacity-0 group-hover:opacity-100'}`}>
                      {ordenDireccion === 'asc' ? '▲' : '▼'}
                    </span>
                  </div>
                </th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors group"
                  onClick={() => toggleOrden('stock')}
                >
                  <div className="flex items-center gap-2">
                    Stock
                    <span className={`text-[10px] ${ordenarPor === 'stock' ? 'text-[#7D2121]' : 'text-gray-300 opacity-0 group-hover:opacity-100'}`}>
                      {ordenDireccion === 'asc' ? '▲' : '▼'}
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Cargando...</td></tr>
              ) : productosOrdenados.map((prod) => (
                <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <img src={prod.imagenUrl || 'https://via.placeholder.com/40'} alt="mini" className="w-10 h-10 rounded object-cover bg-gray-200" />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{prod.nombre}</td>
                  <td className="px-6 py-4 font-bold text-[#7D2121]">{formatCurrency(prod.precio)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`font-bold ${prod.stock < 5 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
                        {prod.stock} unidades
                      </span>
                      {prod.stock < 5 && (
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter bg-red-50 px-1.5 py-0.5 rounded-md border border-red-100 w-fit">
                          Stock Bajo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button onClick={() => openEditModal(prod)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><FiEdit /></button>
                    <button onClick={() => handleDelete(prod.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL (FORMULARIO PRODUCTO) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

            {/* Header del Modal */}
            <div className="bg-[#7D2121] text-white px-6 py-4 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold">{isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}</h2>
              <button onClick={() => setShowModal(false)} className="hover:bg-white/20 p-1 rounded transition-colors"><FiX size={20} /></button>
            </div>

            {/* Formulario Scrollable */}
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Producto</label>
                <input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className={`w-full border px-4 py-2 rounded-lg outline-none focus:ring-2 ${errors.nombre ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-red-200'}`}
                  placeholder="Ej. Croissant"
                />
                {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <span className="text-patisserie-red">$</span> Precio Venta (COP)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 font-bold">
                      $
                    </div>
                    <input
                      type="number"
                      name="precio"
                      placeholder="0"
                      value={formData.precio}
                      onChange={handleInputChange}
                      onFocus={(e) => e.target.select()}
                      className={`w-full border pl-8 pr-4 py-2.5 rounded-xl outline-none focus:ring-4 transition-all ${errors.precio ? 'border-red-500 focus:ring-red-100 ring-red-50' : 'border-gray-200 focus:ring-red-50 focus:border-red-400'}`}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 ml-1">Ej: 15500 (sin puntos ni comas)</p>
                  {errors.precio && <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1"><FiAlertCircle /> {errors.precio}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1">
                    📦 Stock Disponible
                  </label>
                  <input
                    type="number"
                    name="stock"
                    placeholder="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    onFocus={(e) => e.target.select()}
                    className={`w-full border px-4 py-2.5 rounded-xl outline-none focus:ring-4 transition-all ${errors.stock ? 'border-red-500 focus:ring-red-100 ring-red-50' : 'border-gray-200 focus:ring-red-50 focus:border-red-400'}`}
                  />
                  <p className="text-[10px] text-gray-400 ml-1">Unidades físicas en inventario</p>
                  {errors.stock && <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1"><FiAlertCircle /> {errors.stock}</p>}
                </div>
              </div>

              {/* Selector de Categoría + Botón Gestionar */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                <div className="flex gap-2">
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    className="flex-1 w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-200 outline-none bg-white font-medium text-gray-700"
                  >
                    <option value="">Seleccione una categoría...</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Imagen del Producto</label>

                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors min-h-[200px] flex flex-col justify-center items-center ${isDragging ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {isUploading ? (
                    <div className="text-gray-500 flex flex-col items-center">
                      <div className="w-8 h-8 border-4 border-red-200 border-t-red-800 rounded-full animate-spin mb-2"></div>
                      <p className="text-sm">Subiendo imagen...</p>
                    </div>
                  ) : formData.imagenUrl ? (
                    <div className="relative group w-full">
                      <img
                        src={formData.imagenUrl.startsWith('http') ? formData.imagenUrl : `${import.meta.env.VITE_API_URL || 'https://localhost:7108'}${formData.imagenUrl}`}
                        alt="Preview"
                        className="h-64 w-full object-cover rounded-lg shadow-sm mx-auto bg-gray-50"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                        <p className="text-white text-sm font-medium">Arrastra otra imagen para cambiar</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, imagenUrl: '' }))}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full shadow-md hover:bg-red-700"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <FiImage className="mx-auto text-gray-400 mb-2" size={48} />
                      <p className="text-gray-600 font-medium mb-1 text-lg">Arrastra una imagen aquí</p>
                      <p className="text-gray-400 text-sm">o haz clic para seleccionar</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </div>
                  )}
                </div>

                {/* Input manual por si acaso */}
                <div className="mt-2 text-xs text-gray-400 flex items-center gap-1 cursor-pointer hover:text-gray-600" onClick={() => {
                  const url = prompt('Ingrese URL de imagen manual:', formData.imagenUrl);
                  if (url) setFormData(p => ({ ...p, imagenUrl: url }));
                }}>
                  <span>¿Prefieres usar una URL externa? Haz clic aquí.</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-200 outline-none h-24 resize-none" placeholder="Detalles del producto..."></textarea>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 bottom-0 bg-white">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" className="bg-[#7D2121] text-white px-6 py-2 rounded-lg font-bold hover:bg-red-900 transition-colors flex items-center gap-2">
                  <FiSave /> Guardar
                </button>
              </div>

            </form>
          </div>
        </div >
      )}

      {/* --- MODAL DE CATEGORÍAS --- */}
      {showCategoriasModal && (
        <CategoriasModal
          onClose={() => setShowCategoriasModal(false)}
          onChange={fetchCategorias}
        />
      )}

    </div >
  );
};

export default ProductosAdmin;