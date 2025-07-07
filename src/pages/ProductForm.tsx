import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonInput, IonTextarea, IonItem, IonLabel, IonBackButton, IonButtons, IonImg, IonSpinner } from '@ionic/react';
import { useHistory, useParams } from 'react-router';
import { getProductos, addProducto, updateProducto } from '../data/database';

const ProductForm: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [imagen_url, setImagenUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const history = useHistory();
  const { id } = useParams<{ id?: string }>();

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadProducto(parseInt(id));
    }
  }, [id]);

  const loadProducto = async (productId: number) => {
    setLoading(true);
    const productos = await getProductos();
    const producto = productos.find(p => p.id === productId);
    
    if (producto) {
      setNombre(producto.nombre);
      setDescripcion(producto.descripcion);
      setPrecio(producto.precio.toString());
      setCantidad(producto.cantidad.toString());
      setImagenUrl(producto.imagen_url);
    }
    
    setLoading(false);
  };

  const handleSubmit = async () => {
    const productoData = {
      nombre,
      descripcion,
      precio: parseFloat(precio),
      cantidad: parseInt(cantidad),
      imagen_url
    };

    if (isEditing && id) {
      await updateProducto({ ...productoData, id: parseInt(id) });
    } else {
      await addProducto(productoData);
    }

    history.push('/products');
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
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <IonSpinner name="crescent" />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <div className="mb-4">
                <IonItem className="rounded-lg border border-gray-200 mb-2">
                  <IonLabel position="floating" className="text-gray-500">Nombre</IonLabel>
                  <IonInput 
                    value={nombre} 
                    onIonChange={e => setNombre(e.detail.value!)} 
                    required
                    className="text-gray-800"
                  />
                </IonItem>
              </div>

              <div className="mb-4">
                <IonItem className="rounded-lg border border-gray-200 mb-2">
                  <IonLabel position="floating" className="text-gray-500">Descripción</IonLabel>
                  <IonTextarea 
                    value={descripcion} 
                    onIonChange={e => setDescripcion(e.detail.value!)} 
                    rows={3}
                    className="text-gray-800"
                  />
                </IonItem>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <IonItem className="rounded-lg border border-gray-200">
                  <IonLabel position="floating" className="text-gray-500">Precio ($)</IonLabel>
                  <IonInput 
                    type="number" 
                    value={precio} 
                    onIonChange={e => setPrecio(e.detail.value!)} 
                    required
                    className="text-gray-800"
                  />
                </IonItem>

                <IonItem className="rounded-lg border border-gray-200">
                  <IonLabel position="floating" className="text-gray-500">Cantidad</IonLabel>
                  <IonInput 
                    type="number" 
                    value={cantidad} 
                    onIonChange={e => setCantidad(e.detail.value!)} 
                    required
                    className="text-gray-800"
                  />
                </IonItem>
              </div>

              <div className="mb-6">
                <IonItem className="rounded-lg border border-gray-200">
                  <IonLabel position="floating" className="text-gray-500">URL de Imagen</IonLabel>
                  <IonInput 
                    value={imagen_url} 
                    onIonChange={e => setImagenUrl(e.detail.value!)} 
                    className="text-gray-800"
                  />
                </IonItem>
                
                {imagen_url && (
                  <div className="mt-4 flex justify-center">
                    <IonImg 
                      src={imagen_url} 
                      alt="Preview" 
                      className="max-h-40 rounded-md object-contain"
                    />
                  </div>
                )}
              </div>

              <IonButton 
                expand="block" 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-sm"
              >
                {isEditing ? 'Actualizar Producto' : 'Guardar Producto'}
              </IonButton>
            </form>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductForm;