import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonButton, 
  IonInput, 
  IonTextarea, 
  IonItem, 
  IonLabel, 
  IonBackButton, 
  IonButtons, 
  IonImg, 
  IonSpinner,
  IonIcon,
  IonToast
} from '@ionic/react';
import { useHistory, useParams } from 'react-router';
import { getProductos, addProducto, updateProducto } from '../data/database';
import { wifi, warning, closeCircle, checkmarkCircle } from 'ionicons/icons';
import Swal from 'sweetalert2';

const ProductForm: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    cantidad: '',
    imagen_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNetworkToast, setShowNetworkToast] = useState(false);

  const history = useHistory();
  const { id } = useParams<{ id?: string }>();

  useEffect(() => {
    // Verificar estado de conexión inicial
    setOfflineMode(!navigator.onLine);
    
    if (id) {
      setIsEditing(true);
      loadProducto(parseInt(id));
    }
    
    // Escuchar cambios en la conexión
    const handleConnectionChange = () => {
      const isOffline = !navigator.onLine;
      setOfflineMode(isOffline);
      
      if (isOffline) {
        setNetworkError('Estás sin conexión a internet. No podrás guardar tus cambios.');
      } else {
        setNetworkError('¡Conexión restablecida! Ya puedes guardar tus cambios.');
        setShowNetworkToast(true);
      }
    };
    
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
    
    return () => {
      window.removeEventListener('online', handleConnectionChange);
      window.removeEventListener('offline', handleConnectionChange);
    };
  }, [id]);

  const loadProducto = async (productId: number) => {
    try {
      setLoading(true);
      setNetworkError(null);
      
      if (!navigator.onLine) {
        throw new Error('No se puede cargar el producto sin conexión a internet');
      }
      
      const productos = await getProductos();
      const producto = productos.find(p => p.id === productId);
      
      if (producto) {
        setFormData({
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: producto.precio.toString(),
          cantidad: producto.cantidad.toString(),
          imagen_url: producto.imagen_url
        });
      } else {
        throw new Error('Producto no encontrado');
      }
    } catch (err) {
      handleNetworkError(err, 'cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar errores al modificar
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (networkError) setNetworkError(null);
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

  const handleNetworkError = (err: any, action: string) => {
    let errorMessage = `Error al ${action}`;
    
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    
    // Manejar específicamente errores de conexión
    if (errorMessage.includes('conexión') || errorMessage.includes('red') || 
        errorMessage.includes('network') || !navigator.onLine) {
      errorMessage = 'No hay conexión a internet. Por favor, verifica tu conexión.';
    }
    
    setNetworkError(errorMessage);
    console.error(`Error ${action}:`, err);
  };

  const handleSubmit = async () => {
    // Prevenir múltiples envíos
    if (isSubmitting) return;
    setIsSubmitting(true);
    setNetworkError(null);
    
    // Validar formulario
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Verificar conexión antes de intentar guardar
      if (!navigator.onLine) {
        throw new Error('No se puede guardar sin conexión a internet');
      }
      
      const productoData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        cantidad: parseInt(formData.cantidad),
        imagen_url: formData.imagen_url
      };

      if (isEditing && id) {
        await updateProducto({ ...productoData, id: parseInt(id) });
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'El producto ha sido actualizado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        await addProducto(productoData);
        Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: 'El producto ha sido creado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
      }
      
      // Redirigir después de un breve retraso para mostrar el mensaje
      setTimeout(() => {
        history.push('/products');
      }, 1000);
    } catch (err) {
      handleNetworkError(err, 'guardar el producto');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="bg-white shadow-sm">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/products" className="text-indigo-600" />
          </IonButtons>
          <IonTitle className="text-gray-800">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </IonTitle>
          
          {/* Indicador de conexión */}
          {offlineMode && (
            <div slot="end" className="flex items-center mr-4 text-red-600">
              <IonIcon icon={wifi} className="mr-1" />
              <span className="text-sm font-medium">Sin conexión</span>
            </div>
          )}
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        {/* Toast para cambios de conexión */}
                {/* Toast para cambios de conexión */}
        <IonToast
          isOpen={showNetworkToast}
          onDidDismiss={() => setShowNetworkToast(false)}
          message={networkError || 'Estado de conexión cambiado'}
          duration={3000}
          color={offlineMode ? 'warning' : 'success'}
          position="top"
          icon={wifi}
        />
        
        {/* Banner de error de conexión mejorado */}
        {offlineMode && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 flex items-center animate-pulse">
            <IonIcon icon={closeCircle} className="text-xl mr-2 text-red-600" />
            <div>
              <p className="font-medium">Modo sin conexión</p>
              <p className="mt-1 text-sm">
                No puedes guardar cambios hasta que restaures tu conexión a internet
              </p>
            </div>
          </div>
        )}
        
        
        {/* Banner de error de conexión */}
        {offlineMode && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 flex items-center">
            <IonIcon icon={wifi} className="text-xl mr-2 text-red-600" />
            <p className="font-medium">Estás sin conexión a internet. No podrás guardar cambios hasta que te reconectes.</p>
          </div>
        )}
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <IonSpinner name="crescent" className="text-indigo-600 w-8 h-8" />
            <p className="text-gray-600 mt-4">Cargando producto...</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              {/* Campo Nombre */}
              <div className="mb-4">
                <IonItem className={`rounded-lg border ${validationErrors.nombre ? 'border-red-300' : 'border-gray-200'} mb-1`}>
                  <IonLabel position="floating" className="text-gray-500">Nombre *</IonLabel>
                  <IonInput 
                    value={formData.nombre} 
                    onIonChange={e => handleChange('nombre', e.detail.value!)} 
                    className="text-gray-800"
                  />
                </IonItem>
                {validationErrors.nombre && (
                  <div className="text-red-500 text-sm mt-1 ml-1 flex items-start">
                    <IonIcon icon={warning} className="mr-1 mt-0.5 flex-shrink-0" />
                    <span>{validationErrors.nombre}</span>
                  </div>
                )}
              </div>

              {/* Campo Descripción */}
              <div className="mb-4">
                <IonItem className={`rounded-lg border border-gray-200 mb-1`}>
                  <IonLabel position="floating" className="text-gray-500">Descripción</IonLabel>
                  <IonTextarea 
                    value={formData.descripcion} 
                    onIonChange={e => handleChange('descripcion', e.detail.value!)} 
                    rows={3}
                    className="text-gray-800"
                  />
                </IonItem>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Campo Precio */}
                <div>
                  <IonItem className={`rounded-lg border ${validationErrors.precio ? 'border-red-300' : 'border-gray-200'} mb-1`}>
                    <IonLabel position="floating" className="text-gray-500">Precio ($) *</IonLabel>
                    <IonInput 
                      type="number" 
                      value={formData.precio} 
                      onIonChange={e => handleChange('precio', e.detail.value!)} 
                      className="text-gray-800"
                    />
                  </IonItem>
                  {validationErrors.precio && (
                    <div className="text-red-500 text-sm mt-1 ml-1 flex items-start">
                      <IonIcon icon={warning} className="mr-1 mt-0.5 flex-shrink-0" />
                      <span>{validationErrors.precio}</span>
                    </div>
                  )}
                </div>

                {/* Campo Cantidad */}
                <div>
                  <IonItem className={`rounded-lg border ${validationErrors.cantidad ? 'border-red-300' : 'border-gray-200'} mb-1`}>
                    <IonLabel position="floating" className="text-gray-500">Cantidad *</IonLabel>
                    <IonInput 
                      type="number" 
                      value={formData.cantidad} 
                      onIonChange={e => handleChange('cantidad', e.detail.value!)} 
                      className="text-gray-800"
                    />
                  </IonItem>
                  {validationErrors.cantidad && (
                    <div className="text-red-500 text-sm mt-1 ml-1 flex items-start">
                      <IonIcon icon={warning} className="mr-1 mt-0.5 flex-shrink-0" />
                      <span>{validationErrors.cantidad}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Campo Imagen */}
              <div className="mb-6">
                <IonItem className={`rounded-lg border ${validationErrors.imagen_url ? 'border-red-300' : 'border-gray-200'} mb-1`}>
                  <IonLabel position="floating" className="text-gray-500">URL de Imagen</IonLabel>
                  <IonInput 
                    value={formData.imagen_url} 
                    onIonChange={e => handleChange('imagen_url', e.detail.value!)} 
                    className="text-gray-800"
                  />
                </IonItem>
                {validationErrors.imagen_url && (
                  <div className="text-red-500 text-sm mt-1 ml-1 flex items-start">
                    <IonIcon icon={warning} className="mr-1 mt-0.5 flex-shrink-0" />
                    <span>{validationErrors.imagen_url}</span>
                  </div>
                )}
                
                {formData.imagen_url && !validationErrors.imagen_url && (
                  <div className="mt-4 flex justify-center">
                    <img 
                      src={formData.imagen_url} 
                      alt="Preview" 
                      className="max-h-40 rounded-md object-contain border border-gray-200 p-1"
                    />
                  </div>
                )}
              </div>

             <IonButton 
          expand="block" 
          type="submit"
          className={`font-medium py-3 px-4 rounded-md shadow-sm transition ${
            offlineMode 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
          disabled={offlineMode || isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <IonSpinner name="crescent" className="text-white mr-2" />
              {isEditing ? 'Actualizando...' : 'Guardando...'}
            </div>
          ) : offlineMode ? (  // Texto especial cuando está offline
            <div className="flex items-center">
              <IonIcon icon={wifi} className="mr-2" />
              Guardar (no disponible)
            </div>
          ) : isEditing ? (
            'Actualizar Producto'
          ) : (
            'Guardar Producto'
          )}
        </IonButton>
              {/* Mensaje de ayuda para campos obligatorios */}
              <p className="text-gray-500 text-sm mt-4 text-right">* Campos obligatorios</p>
              
              {/* Resumen de errores si existe algún problema de validación */}
              {Object.keys(validationErrors).length > 0 && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-red-800 font-medium flex items-center">
                    <IonIcon icon={warning} className="text-red-600 mr-2" />
                    Por favor, corrige los siguientes errores:
                  </h3>
                  <ul className="mt-2 text-red-700 list-disc pl-5">
                    {Object.values(validationErrors).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Mostrar errores de red en rojo */}
              {networkError && (
                <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
                  <h3 className="font-medium flex items-center">
                    <IonIcon icon={wifi} className="text-red-600 mr-2" />
                    Error de red
                  </h3>
                  <p className="mt-2 ml-6">{networkError}</p>
                  
                  {!offlineMode && (
                    <button
                      onClick={handleSubmit}
                      className="mt-3 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition"
                    >
                      Reintentar
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductForm;