import React, { useState, useEffect } from 'react';
import { 
  IonPage, 
  IonContent, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonBackButton,
  IonToast
} from '@ionic/react';
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
  const [offlineMode, setOfflineMode] = useState(false);
  const [networkError, setNetworkError] = useState('');
  const [showNetworkToast, setShowNetworkToast] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Detectar cambios en la conexión
  useEffect(() => {
    const handleConnectionChange = () => {
      const isOffline = !navigator.onLine;
      setOfflineMode(isOffline);
      
      if (isOffline) {
        setNetworkError('Estás sin conexión a internet. No podrás guardar tus cambios.');
        setShowNetworkToast(true);
      } else {
        setNetworkError('');
      }
    };
    
    // Estado inicial
    setOfflineMode(!navigator.onLine);
    
    // Event listeners
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
    
    return () => {
      window.removeEventListener('online', handleConnectionChange);
      window.removeEventListener('offline', handleConnectionChange);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar errores al modificar
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Actualizar vista previa de imagen
    if (name === 'imagen_url') {
      setPreviewImage(value);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (!formData.precio) {
      errors.precio = 'El precio es obligatorio';
    } else if (parseFloat(formData.precio) <= 0) {
      errors.precio = 'El precio debe ser mayor que 0';
    }
    
    if (!formData.cantidad) {
      errors.cantidad = 'La cantidad es obligatoria';
    } else if (parseInt(formData.cantidad) < 0) {
      errors.cantidad = 'La cantidad no puede ser negativa';
    }
    
    if (formData.imagen_url && !isValidUrl(formData.imagen_url)) {
      errors.imagen_url = 'La URL de la imagen no es válida';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }
    
    // Verificar conexión
    if (!navigator.onLine) {
      setNetworkError('No se puede guardar sin conexión a internet');
      setShowNetworkToast(true);
      return;
    }
    
    setLoading(true);

    try {
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
      console.error('Error al crear el producto:', error);
      setNetworkError('Error al guardar el producto. Inténtalo de nuevo.');
      setShowNetworkToast(true);
    } finally {
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
          
          {/* Indicador de conexión */}
          <div slot="end" className={`flex items-center mr-4 ${offlineMode ? 'text-red-600' : 'text-green-600'}`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 mr-1 ${offlineMode ? 'text-red-500' : 'text-green-500'}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              {offlineMode ? (
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
              )}
            </svg>
            <span className="text-sm font-medium">
              {offlineMode ? 'Sin conexión' : 'Conectado'}
            </span>
          </div>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding-horizontal !h-full !min-h-screen">
        {/* Toast de estado de red */}
        <IonToast
          isOpen={showNetworkToast}
          onDidDismiss={() => setShowNetworkToast(false)}
          message={networkError}
          duration={3000}
          color={offlineMode ? "warning" : "danger"}
          position="top"
        />
        
        <div className="max-w-2xl mx-auto p-6 py-3">
          {/* Banner de conexión */}
          {offlineMode && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">Estás trabajando sin conexión</p>
                <p className="mt-1 text-sm">
                  Los cambios se guardarán cuando se restablezca la conexión a internet
                </p>
              </div>
            </div>
          )}
          
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
                          Nombre del Producto *
                        </label>
                        <input
                          type="text"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border ${
                            validationErrors.nombre ? 'border-red-300' : 'border-gray-300'
                          } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                          placeholder="Ej: Smartphone X"
                        />
                        {validationErrors.nombre && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {validationErrors.nombre}
                          </p>
                        )}
                      </div>
                      
                      {/* Precio */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio ($) *
                        </label>
                        <input
                          type="number"
                          name="precio"
                          value={formData.precio}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          className={`w-full px-4 py-2 border ${
                            validationErrors.precio ? 'border-red-300' : 'border-gray-300'
                          } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                          placeholder="Ej: 299.99"
                        />
                        {validationErrors.precio && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {validationErrors.precio}
                          </p>
                        )}
                      </div>
                      
                      {/* Cantidad */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cantidad en Stock *
                        </label>
                        <input
                          type="number"
                          name="cantidad"
                          value={formData.cantidad}
                          onChange={handleChange}
                          min="0"
                          className={`w-full px-4 py-2 border ${
                            validationErrors.cantidad ? 'border-red-300' : 'border-gray-300'
                          } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                          placeholder="Ej: 50"
                        />
                        {validationErrors.cantidad && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {validationErrors.cantidad}
                          </p>
                        )}
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
                          className={`w-full px-4 py-2 border ${
                            validationErrors.imagen_url ? 'border-red-300' : 'border-gray-300'
                          } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                          placeholder="https://ejemplo.com/imagen.jpg"
                        />
                        {validationErrors.imagen_url && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {validationErrors.imagen_url}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vista Previa
                        </label>
                        <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden min-h-[200px]">
                          {previewImage ? (
                            <img 
                              src={previewImage} 
                              alt="Vista previa" 
                              className="object-contain max-h-48 w-full"
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
                      disabled={loading || offlineMode}
                      className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition flex items-center ${
                        offlineMode 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : loading 
                            ? 'bg-indigo-400 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {offlineMode ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          Sin conexión
                        </>
                      ) : loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Guardando...
                        </>
                      ) : (
                        'Crear Producto'
                      )}
                    </button>
                  </div>
                  
                  {/* Mensaje de campos obligatorios */}
                  <p className="text-gray-500 text-sm mt-4 text-right">* Campos obligatorios</p>
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