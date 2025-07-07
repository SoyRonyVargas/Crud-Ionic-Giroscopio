import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonIcon, useIonToast } from '@ionic/react';
import { trash, arrowBack, cart, wallet } from 'ionicons/icons';
import { getCarrito, saveCarrito, clearCarrito, ItemCarrito } from '../data/database';
import { getProductos, Producto } from '../data/database';
import Swal from 'sweetalert2';
import PaypalButton from '../components/PaypalButton';

const CarritoPage: React.FC = () => {
  const [carritoItems, setCarritoItems] = useState<ItemCarrito[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [present] = useIonToast();
const [mostrarPaypal, setMostrarPaypal] = useState(false);

  // Cargar carrito y productos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const carrito = await getCarrito();
        setCarritoItems(carrito);
        
        const todosProductos = await getProductos();
        setProductos(todosProductos);
      } catch (error) {
        console.error('Error cargando datos:', error);
        present({
          message: 'Error cargando el carrito',
          duration: 2000,
          color: 'danger'
        });
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, []);

  // Actualizar cantidad de un producto en el carrito
  const actualizarCantidad = async (productoId: number, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;
    
    const nuevoCarrito = carritoItems.map(item => 
      item.productoId === productoId ? { ...item, cantidad: nuevaCantidad } : item
    );
    
    setCarritoItems(nuevoCarrito);
    await saveCarrito(nuevoCarrito);
  };

  // Eliminar un producto del carrito
  const eliminarDelCarrito = async (productoId: number) => {
    const nuevoCarrito = carritoItems.filter(item => item.productoId !== productoId);
    setCarritoItems(nuevoCarrito);
    await saveCarrito(nuevoCarrito);
    
    present({
      message: 'Producto eliminado del carrito',
      duration: 1500,
      color: 'success'
    });
  };

  // Vaciar todo el carrito
  const vaciarCarrito = async () => {
    Swal.fire({
      title: 'Vaciar carrito',
      text: '¿Estás seguro de que deseas vaciar todo el carrito?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, vaciar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await clearCarrito();
        setCarritoItems([]);
        present({
          message: 'Carrito vaciado',
          duration: 1500,
          color: 'success'
        });
      }
    });
  };

  // Calcular total del carrito
  const calcularTotal = () => {
    return carritoItems.reduce((total, item) => {
      const producto = productos.find(p => p.id === item.productoId);
      return total + (producto ? producto.precio * item.cantidad : 0);
    }, 0);
  };

  // Calcular cantidad total de productos
  const calcularCantidadTotal = () => {
    return carritoItems.reduce((total, item) => total + item.cantidad, 0);
  };

  // Procesar pago
  // Obtener detalles de un producto
  const obtenerDetallesProducto = (productoId: number) => {
    return productos.find(p => p.id === productoId);
  };

  return (
    <IonPage className="bg-gray-50">
      <IonHeader className="bg-white shadow-sm">
        <IonToolbar className="px-4">
          <IonButtons slot="start">
            <IonBackButton 
              defaultHref="/products" 
              icon={arrowBack}
              className="text-indigo-600"
            />
          </IonButtons>
          <IonTitle className="text-gray-800 font-bold">Carrito de Compras</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding-horizontal !h-full !min-h-screen">
         <button 
              color="danger"
              onClick={vaciarCarrito}
              disabled={carritoItems.length === 0}
              className='mx-2 bg-red-600 w-[90%] mx-auto justify-center hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <IonIcon icon={trash} className="mr-1" />
              Vaciar
            </button>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : carritoItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto bg-indigo-100 p-4 rounded-full w-24 h-24 flex items-center justify-center mb-6">
              <IonIcon icon={cart} className="text-indigo-600 text-5xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h3>
            <p className="text-gray-600 mb-6">Agrega productos desde la tienda para comenzar</p>
            <IonButton 
              routerLink="/products"
              className="bg-indigo-600 hover:bg-indigo-700 font-medium"
            >
              Ir a la tienda
            </IonButton>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Lista de productos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800">Productos ({calcularCantidadTotal()})</h3>
              </div>
              
              <div className="divide-y divide-gray-100">
                {carritoItems.map((item) => {
                  const producto = obtenerDetallesProducto(item.productoId);
                  if (!producto) return null;
                  
                  return (
                    <div key={item.productoId} className="p-4">
                      <div className="flex items-start">
                        {/* Imagen del producto */}
                        <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                          {producto.imagen_url ? (
                            <img
                              src={producto.imagen_url}
                              alt={producto.nombre}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/100?text=Imagen';
                              }}
                            />
                          ) : (
                            <div className="bg-gray-100 w-full h-full flex items-center justify-center">
                              <IonIcon icon={cart} className="text-gray-400 text-xl" />
                            </div>
                          )}
                        </div>
                        
                        {/* Detalles del producto */}
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium text-gray-900">{producto.nombre}</h4>
                            <button 
                              onClick={() => eliminarDelCarrito(item.productoId)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <IonIcon icon={trash} className="text-lg" />
                            </button>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {producto.descripcion || 'Sin descripción'}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center">
                              <button 
                                onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                              >
                                -
                              </button>
                              
                              <span className="mx-3 font-medium">{item.cantidad}</span>
                              
                              <button 
                                onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                              >
                                +
                              </button>
                            </div>
                            
                            <span className="font-bold text-indigo-600">
                              ${(producto.precio * item.cantidad).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Dirección de entrega */}
            
            {/* Resumen de compra */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-bold text-gray-800 mb-4">Resumen de Compra</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${calcularTotal().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-medium">Gratis</span>
                </div>
                
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-indigo-600">${calcularTotal().toFixed(2)}</span>
                </div>
              </div>
              
              {!mostrarPaypal ? (
  <button 
    className="mt-6 px-6 w-full text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg"
    onClick={() => setMostrarPaypal(true)}
  >
    <IonIcon icon={wallet} className="mr-2" />
    Proceder al Pago
  </button>
) : (
  <div className="mt-6">
    <PaypalButton 
      total={calcularTotal()}
      onSuccess={async () => {
        await clearCarrito();
        Swal.fire({
          title: '¡Compra realizada!',
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          window.location.href = '/products';
        });
      }}
    />
  </div>
)}
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default CarritoPage;