import React, { useState } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/react';
import { useHistory } from 'react-router';
import { addProducto } from '../data/database';

const ProductCreatePage: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    cantidad: '',
    imagen_url: ''
  });
  const [previewImage, setPreviewImage] = useState('');

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
    setLoading(true);

    try {

        debugger
        
        await addProducto({
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            precio: parseFloat(formData.precio),
            cantidad: parseInt(formData.cantidad),
            imagen_url: formData.imagen_url
        });

        // Redirigir después de crear
        setTimeout(() => {
            history.push('/products');
        }, 500);

        } catch (error) {
            console.log(error);
            debugger
            console.error('Error al crear el producto:', error);
            setLoading(false);
        }
  };

  return (
    <IonPage>
      <IonHeader className="bg-white shadow-sm">
        <IonToolbar className="px-4">
          <IonButtons slot="start">
            <IonBackButton 
              defaultHref="/products" 
              className="text-indigo-600 hover:text-indigo-800"
              text="Volver"
            />
          </IonButtons>
          <IonTitle className="text-gray-800 font-semibold">Nuevo Producto</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent  className="ion-padding-horizontal !h-full !min-h-screen">
        <div className="max-w-2xl mx-auto p-6 py-3">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-1 bg-gradient-to-r from-indigo-500 to-purple-600">
              <div className="bg-white p-6 rounded-t-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Crear Nuevo Producto</h2>
                <p className="text-gray-600 mb-6">Completa los detalles del producto</p>
                
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
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => history.push('/products')}
                      className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition ${
                        loading 
                          ? 'bg-indigo-400 cursor-not-allowed' 
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Guardando...
                        </span>
                      ) : 'Crear Producto'}
                    </button>
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
              Puedes usar servicios como <a href="https://imgbb.com/" target="_blank" rel="noreferrer" className="underline">ImgBB</a> o <a href="https://postimages.org/" target="_blank" rel="noreferrer" className="underline">PostImages</a> para subir imágenes y obtener URLs.
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProductCreatePage;