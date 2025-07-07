import { Preferences } from '@capacitor/preferences';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  imagen_url: string;
}

const STORAGE_KEY = 'productos';

const getAll = async (): Promise<Producto[]> => {
  const { value } = await Preferences.get({ key: STORAGE_KEY });
  return value ? JSON.parse(value) : [];
};

const saveAll = async (productos: Producto[]) => {
  await Preferences.set({
    key: STORAGE_KEY,
    value: JSON.stringify(productos),
  });
};

export const getProductos = async (): Promise<Producto[]> => {
  return await getAll();
};

export const addProducto = async (producto: Omit<Producto, 'id'>): Promise<void> => {
  const productos = await getAll();
  const newId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
  const nuevoProducto: Producto = { id: newId, ...producto };
  productos.push(nuevoProducto);
  await saveAll(productos);
};

export const updateProducto = async (producto: Producto): Promise<void> => {
  const productos = await getAll();
  const index = productos.findIndex(p => p.id === producto.id);
  if (index !== -1) {
    productos[index] = producto;
    await saveAll(productos);
  }
};

export const deleteProducto = async (id: number): Promise<void> => {
  const productos = await getAll();
  const nuevosProductos = productos.filter(p => p.id !== id);
  await saveAll(nuevosProductos);
};

export const getProductoById = async (id: number): Promise<Producto | undefined> => {
    const productos = await getAll();
    return productos.find(p => p.id === id);
}

export const clearProductos = async (): Promise<void> => {
  await Preferences.remove({ key: STORAGE_KEY });
};

export interface ItemCarrito {
  productoId: number;
  cantidad: number;
}

const CARRITO_KEY = 'carrito';

export const getCarrito = async (): Promise<ItemCarrito[]> => {
  const { value } = await Preferences.get({ key: CARRITO_KEY });
  return value ? JSON.parse(value) : [];
};

export const saveCarrito = async (items: ItemCarrito[]): Promise<void> => {
  await Preferences.set({
    key: CARRITO_KEY,
    value: JSON.stringify(items),
  });
};

export const addToCarrito = async (productoId: number): Promise<void> => {
  const carrito = await getCarrito();
  const index = carrito.findIndex((item) => item.productoId === productoId);
  
  if (index !== -1) {
    carrito[index].cantidad += 1;
  } else {
    carrito.push({ productoId, cantidad: 1 });
  }

  await saveCarrito(carrito);
};

export const clearCarrito = async (): Promise<void> => {
  await Preferences.remove({ key: CARRITO_KEY });
};