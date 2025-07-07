import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonIcon, IonFab, IonFabButton } from '@ionic/react';
import { add, cart, create, trash } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { getProductos, deleteProducto, addToCarrito } from '../data/database';
import { Producto } from '../data/database';
import Swal from 'sweetalert2';
import { useGyroscope } from '../hooks/useGyroscope';

const ProductListPage: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'nombre' | 'precio' | 'cantidad'>('nombre');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const history = useHistory();
  const { alpha, beta, gamma } = useGyroscope();
  // Cargar productos al iniciar
  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    try {
      setLoading(true);
      const productosData = await getProductos();
      setProductos(productosData);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Eliminar Producto',
            text: '¿Estás seguro de que deseas eliminar este producto?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc2626', // rojo
            cancelButtonColor: '#6b7280'   // gris
        }).then(async (result) => {
            if (result.isConfirmed) {
            try {
                await deleteProducto(id);
                loadProductos();

                Swal.fire({
                icon: 'success',
                title: 'Producto eliminado',
                showConfirmButton: false,
                timer: 1500
                });
            } catch (error) {
                console.error('Error eliminando producto:', error);
                Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el producto'
                });
            }
            }
        });
    };


  // Filtrar y ordenar productos
  const filteredProducts = productos
    .filter(producto => 
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'nombre') {
        comparison = a.nombre.localeCompare(b.nombre);
      } else if (sortBy === 'precio') {
        comparison = a.precio - b.precio;
      } else if (sortBy === 'cantidad') {
        comparison = a.cantidad - b.cantidad;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const toggleSort = (field: 'nombre' | 'precio' | 'cantidad') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  return (
    <IonPage className="bg-gray-50 px-6">
      <IonHeader className="bg-white shadow-sm b-5">
        <IonToolbar className="px-4">
          <IonTitle className="text-gray-800 font-semibold">Lista de Productos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent  className="ion-padding-horizontal !h-full !min-h-screen">
        {/* Barra de búsqueda y filtros */}

            
        <div className=" items-center justify-between mb-4">
            <strong>Giroscopio:</strong>
            <p className='flex'>Alpha (Z): {alpha.toFixed(2)}</p>
            <p className='flex'>Beta (X): {beta.toFixed(2)}</p>
            <p className='flex'>Gamma (Y): {gamma.toFixed(2)}</p>
        </div>
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition pl-12"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Filtros de ordenación */}
          <div className="flex flex-wrap gap-2 mt-3">
            <button 
              onClick={() => toggleSort('nombre')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center ${
                sortBy === 'nombre' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Nombre
              {sortBy === 'nombre' && (
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
            
            <button 
              onClick={() => toggleSort('precio')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center ${
                sortBy === 'precio' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Precio
              {sortBy === 'precio' && (
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
            
            <button 
              onClick={() => toggleSort('cantidad')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center ${
                sortBy === 'cantidad' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Stock
              {sortBy === 'cantidad' && (
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
        onClick={() => history.push('/carrito')}
        className="flex w-full justify-center items-center text-lg font-medium bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg shadow transition"
    >
        <IonIcon icon={cart} className="text-white mr-2" />
        Ver Carrito
    </button>
        <button
              onClick={() => history.push('/products/new')}
              className="bg-indigo-600 justify-center items-center text-lg w-full mt-3 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm mb-6 transition flex items-center"
            >
              Crear Nuevo Producto 
            </button>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto bg-gray-200 border-2 border-dashed border-gray-300 rounded-xl w-16 h-16 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron productos</h3>
            <p className="text-gray-500 mb-6">Intenta con otro término de búsqueda o crea un nuevo producto</p>
            
            
          </div>
        ) : (
          <div className="mb-50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((producto) => (
              <div 
                key={producto.id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition"
              >
                {/* Imagen del producto */}
                <div className="h-48 overflow-hidden">
                  {producto.imagen_url ? (
                    // <img 
                    //   src={producto.imagen_url} 
                    //   alt={producto.nombre} 
                    //   className="w-full h-full object-cover"
                    //   onError={(e) => {
                    //     e.currentTarget.src = 'https://via.placeholder.com/300?text=Imagen+no+disponible';
                    //   }}
                    // />
                    <ProductImage
                        src={producto.imagen_url}
                        alt={producto.nombre}
                    />
                  ) : (
                    <div className="bg-gray-200 border-2 border-dashed border-gray-300 w-full h-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Información del producto */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 truncate">{producto.nombre}</h3>
                    <span className="text-lg font-semibold text-indigo-600">${producto.precio.toFixed(2)}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {producto.descripcion || 'Sin descripción'}
                  </p>
                  
                  <div className="justify-between items-center mt-4">
                    <span className={`block w-[100px] mb-3 px-3 py-1 rounded-full text-xs font-medium ${
                      producto.cantidad > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {producto.cantidad > 0 ? `Stock: ${producto.cantidad}` : 'Agotado'}
                    </span>
                    
                    <div className="space-x-2">
                     <button
                        onClick={() => history.push(`/products/edit/${producto.id}`)}
                        className="flex w-full items-center justify-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-red-700 rounded-lg shadow-sm transition"
                        >
                        <IonIcon icon={create} className="text-white mr-2 text-base" />
                        Editar
                    </button>
                      
                     <button
                        onClick={() => handleDelete(producto.id)}
                        className="flex w-full items-center justify-center px-3 py-1.5 text-sm my-3 font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition"
                        >
                        <IonIcon icon={trash} className="text-white mr-2 text-base" />
                        Eliminar
                    </button>
                    <button
                    onClick={() => handleDelete(producto.id)}
                    className="flex w-full items-center justify-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-red-700 rounded-lg shadow-sm transition"
                    >
                    <IonIcon icon={cart} className="text-white mr-2 text-base" />
                    Comprar
                    </button>
                    <button
                    onClick={async () => {
                        await addToCarrito(producto.id);
                        Swal.fire({
                        position: 'top-end',
                        icon: 'success',
                        title: 'Agregado al carrito',
                        showConfirmButton: false,
                        timer: 1000,
                        toast: true,
                        });
                    }}
                    className="flex mt-3 w-full items-center justify-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition"
                    >
                    <IonIcon icon={cart} className="text-white mr-2 text-base" />
                    Agregar al Carrito
                    </button>

                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Botón flotante para agregar */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed" className="mb-4 mr-4">
          <IonFabButton 
            onClick={() => history.push('/products/new')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg"
          >
            <IonIcon icon={add} className="text-white" />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

const ProductImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const { alpha, beta, gamma } = useGyroscope();

  const filterStyle = {
    filter: `
      brightness(${1 + beta / 100})
      saturate(${1 + gamma / 100})
      contrast(${1 + alpha / 200})
    `,
    transform: `rotate(${alpha / 10}deg)`,
    transition: 'filter 0.3s ease, transform 0.3s ease',
  };

  return (
    <img
      src={src}
      alt={alt}
      style={filterStyle}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.currentTarget.src = 'https://via.placeholder.com/300?text=Imagen+no+disponible';
      }}
    />
  );
};

export default ProductListPage;