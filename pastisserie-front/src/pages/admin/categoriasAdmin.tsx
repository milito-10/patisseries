import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { FiEdit, FiTrash2, FiPlus, FiFolder } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Categoria {
  id: number;
  nombre: string;
  // Agrega más campos si tu backend los tiene (ej. descripcion, imagen)
}

const CategoriasAdmin = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await api.get('/categorias');
      // Asegúrate de que response.data sea el array, o response.data.data
      setCategorias(response.data); 
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta categoría?')) return;
    try {
      await api.delete(`/categorias/${id}`);
      toast.success('Categoría eliminada');
      fetchCategorias();
    } catch (error) {
      toast.error('Error al eliminar. Puede que tenga productos asociados.');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
          <p className="text-gray-500">Organiza tus productos</p>
        </div>
        <button className="bg-[#7D2121] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-red-900 transition-colors shadow-md">
          <FiPlus /> Nueva Categoría
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={3} className="text-center py-8">Cargando...</td></tr>
              ) : categorias.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-8">No hay categorías registradas.</td></tr>
              ) : (
                categorias.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">#{cat.id}</td>
                    <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-2">
                        <FiFolder className="text-[#EBCfa8]" /> {cat.nombre}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        <FiEdit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoriasAdmin;