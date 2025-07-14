
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  imagen_url: string;
}

export interface ItemCarrito {
  productoId: number;
  cantidad: number;
  id: number;
}


const API_BASE_URL = 'https://687549acdd06792b9c97708b.mockapi.io';

// Servicio para Productos
export const getProductos = async (): Promise<Producto[]> => {
  const response = await fetch(`${API_BASE_URL}/productos`);
  return await response.json();
};

export const addProducto = async (producto: Omit<Producto, 'id'>): Promise<Producto> => {
  const response = await fetch(`${API_BASE_URL}/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(producto)
  });
  return await response.json();
};

export const updateProducto = async (producto: Producto): Promise<Producto> => {
  const response = await fetch(`${API_BASE_URL}/productos/${producto.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(producto)
  });
  return await response.json();
};

export const deleteProducto = async (id: number): Promise<void> => {
  await fetch(`${API_BASE_URL}/productos/${id}`, {
    method: 'DELETE'
  });
};

export const getProductoById = async (id: number): Promise<Producto> => {
  const response = await fetch(`${API_BASE_URL}/productos/${id}`);
  return await response.json();
};

// Servicio para Carrito
export const getCarrito = async (): Promise<ItemCarrito[]> => {
  const response = await fetch(`${API_BASE_URL}/carrito`);
  return await response.json();
};

export const saveCarrito = async (items: ItemCarrito[]): Promise<void> => {
  // Primero limpiamos el carrito existente
  const currentItems = await getCarrito();
  await Promise.all(currentItems.map(item => 
    fetch(`${API_BASE_URL}/carrito/${item.id}`, { method: 'DELETE' })
  ));
  
  // Luego agregamos los nuevos items
  await Promise.all(items.map(item =>
    fetch(`${API_BASE_URL}/carrito`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    })
  ));
};

export const addToCarrito = async (productoId: number): Promise<void> => {
  const carrito = await getCarrito();
  const existingItem = carrito.find(item => item.productoId === productoId);

  if (existingItem) {
    await fetch(`${API_BASE_URL}/carrito/${existingItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...existingItem,
        cantidad: existingItem.cantidad + 1
      })
    });
  } else {
    await fetch(`${API_BASE_URL}/carrito`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productoId, cantidad: 1 })
    });
  }
};

export const clearCarrito = async (): Promise<void> => {
  const carrito = await getCarrito();
  await Promise.all(carrito.map(item => 
    fetch(`${API_BASE_URL}/carrito/${item.id}`, { method: 'DELETE' })
  ));
};