import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonIcon, IonSpinner, useIonToast } from '@ionic/react';
import { trash, save, arrowBack } from 'ionicons/icons';
import { useParams, useHistory } from 'react-router';
import { getProductoById, updateProducto, deleteProducto } from '../data/database';
import { Producto } from '../data/database';
import swal from 'sweetalert2';

const ProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [present] = useIonToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [producto, setProducto] = useState<Producto | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    cantidad: '',
    imagen_url: ''
  });
  const [previewImage, setPreviewImage] = useState('');

  // Cargar el producto al montar el componente
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const productData = await getProductoById(parseInt(id));
        if (productData) {
          setProducto(productData);
          setFormData({
            nombre: productData.nombre,
            descripcion: productData.descripcion || '',
            precio: productData.precio.toString(),
            cantidad: productData.cantidad.toString(),
            imagen_url: productData.imagen_url || ''
          });
          setPreviewImage(productData.imagen_url || '');
        }
      } catch (error) {
        console.error('Error cargando producto:', error);
        present({
          message: 'Error cargando producto',
          duration: 2000,
          color: 'danger'
        });
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, present]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Actualizar vista previa de imagen
    if (name === 'imagen_url') {
      setPreviewImage(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    if (!id || !producto) return;

    try {
      await updateProducto({
        id: parseInt(id),
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        cantidad: parseInt(formData.cantidad),
        imagen_url: formData.imagen_url
      });

      swal.fire({
        title: 'Éxito',
        text: 'Producto actualizado correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });

      // Redirigir después de un breve retraso
      setTimeout(() => {
        history.push('/products');
      }, 500);
    } catch (error) {
      console.error('Error actualizando producto:', error);
      swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el producto. Por favor, inténtalo de nuevo.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      setSaving(false);
    }
  };

  const handleDelete = () => {
    swal.fire({
      title: 'Confirmar Eliminación',
        text: '¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
            await deleteProducto(parseInt(id));
            swal.fire({
                title: 'Producto Eliminado',
                text: 'El producto ha sido eliminado correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
            history.push('/products');
            } catch (error) {
            console.error('Error eliminando producto:', error);
            swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar el producto. Por favor, inténtalo de nuevo.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
            }
        }
        }
    );
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/products" />
            </IonButtons>
            <IonTitle>Editar Producto</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="flex justify-center items-center">
          <IonSpinner name="crescent" className="text-indigo-600 w-12 h-12" />
        </IonContent>
      </IonPage>
    );
  }

  if (!producto) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/products" />
            </IonButtons>
            <IonTitle>Producto no encontrado</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent  className="ion-padding-horizontal !h-full !min-h-screen">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Producto no encontrado</h3>
            <p className="text-gray-500 mb-6">El producto que intentas editar no existe o ha sido eliminado.</p>
            <button 
              onClick={() => history.push('/products')}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Volver a la lista
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage className="px-6 pb-5">
      <IonHeader className="bg-white shadow-md">
        <IonToolbar className="px-4">
          <IonButtons slot="start">
            <IonBackButton 
              defaultHref="/products" 
              text=""
              icon={arrowBack}
              className="text-indigo-600 hover:text-indigo-800"
            />
          </IonButtons>
          <IonTitle className="text-gray-800 font-bold text-lg">Editar Producto</IonTitle>
          <IonButtons slot="end">
            <button
              color="danger"
              onClick={handleDelete}
              className="flex items-center px-5 py-2 text-sm font-medium text-white rounded-lg transition flex items-center bg-red-600 hover:bg-indigo-700"
            >
              <IonIcon icon={trash} className="mr-1" />
              Eliminar
            </button>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="pb-5 ion-padding-horizontal !h-full !min-h-screen">
        <div className="max-w-3xl mx-auto">
          <div className=" rounded-xl shadow-lg overflow-hidden">
            {/* Cabecera con gradiente */}
            <div className="p-1 bg-gradient-to-r from-indigo-500 to-purple-600">
              <div className="bg-white p-6 rounded-t-lg">
                <div className="flex items-center mb-4">
                  <div className=" p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h2 className="ml-4 text-2xl font-bold text-gray-800">Editando: {producto.nombre}</h2>
                </div>
                
                <form onSubmit={handleSubmit}>
                  {/* Grupo de campos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      {/* Nombre */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre del Producto
                        </label>
                        <input
                          type="text"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                          placeholder="Ej: Smartphone X"
                        />
                      </div>
                      
                      {/* Precio */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio ($)
                        </label>
                        <input
                          type="number"
                          name="precio"
                          value={formData.precio}
                          onChange={handleChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                          placeholder="Ej: 299.99"
                        />
                      </div>
                      
                      {/* Cantidad */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cantidad en Stock
                        </label>
                        <input
                          type="number"
                          name="cantidad"
                          value={formData.cantidad}
                          onChange={handleChange}
                          required
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                          placeholder="Ej: 50"
                        />
                      </div>
                    </div>
                    
                    {/* Vista previa de imagen */}
                    <div className="flex flex-col">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          URL de la Imagen
                        </label>
                        <input
                          type="url"
                          name="imagen_url"
                          value={formData.imagen_url}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                          placeholder="https://ejemplo.com/imagen.jpg"
                        />
                      </div>
                      
                      <div className="flex-1 flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vista Previa
                        </label>
                        <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                          {previewImage ? (
                            <img 
                              src={previewImage} 
                              alt="Vista previa" 
                              className="object-contain max-h-48 w-full"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/300?text=Imagen+no+disponible';
                              }}
                            />
                          ) : (
                            <div className="text-gray-400 py-12 text-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p>Previsualización de la imagen</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Descripción */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="Describe las características del producto..."
                    ></textarea>
                  </div>
                  
                  {/* Botones */}
                  <div className=" justify-between items-center pt-6 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">ID:</span> {id}
                    </div>
                    
                    <div className=" space-x-3">
                      <button
                        type="button"
                        onClick={() => history.push('/products')}
                        className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition flex items-center ${
                          saving 
                            ? 'bg-indigo-400 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        {saving ? (
                          <span className="flex items-center">
                            <IonSpinner name="crescent" className="mr-2 w-4 h-4" />
                            Guardando...
                          </span>
                        ) : (
                          <>
                            <IonIcon icon={save} className="mr-1" />
                            Guardar Cambios
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          {/* Consejos para imágenes */}
          <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-lg p-4">
            <h3 className="font-medium text-indigo-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Consejos para imágenes
            </h3>
            <p className="text-indigo-600 mt-1 text-sm">
              Usa servicios como <a href="https://imgbb.com/" target="_blank" rel="noreferrer" className="underline">ImgBB</a> o <a href="https://postimages.org/" target="_blank" rel="noreferrer" className="underline">PostImages</a> para subir imágenes y obtener URLs.
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProductEditPage;