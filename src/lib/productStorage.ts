import { pb } from './pocketbase';
import { Product, ProductFormData } from '@/types/product';

const COLLECTION_NAME = 'products';

// --- OBTENER PRODUCTOS ---
export const getProducts = async (): Promise<Product[]> => {
  try {
    // Obtenemos la lista completa ordenada por fecha de creación
    const records = await pb.collection(COLLECTION_NAME).getFullList<Product>({
      sort: '-created',
    });
    return records;
  } catch (error) {
    console.error('Error cargando productos desde PocketBase:', error);
    return [];
  }
};

// --- CREAR PRODUCTO ---
export const addProduct = async (data: ProductFormData): Promise<Product> => {
  try {
    const newProduct = await pb.collection(COLLECTION_NAME).create<Product>(data);
    return newProduct;
  } catch (error) {
    console.error('Error creando producto:', error);
    throw error;
  }
};

// --- ACTUALIZAR PRODUCTO ---
export const updateProduct = async (id: string, data: Partial<ProductFormData>): Promise<Product> => {
  try {
    const updatedProduct = await pb.collection(COLLECTION_NAME).update<Product>(id, data);
    return updatedProduct;
  } catch (error) {
    console.error(`Error actualizando producto ${id}:`, error);
    throw error;
  }
};

// --- ELIMINAR PRODUCTO ---
export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    await pb.collection(COLLECTION_NAME).delete(id);
    return true;
  } catch (error) {
    console.error(`Error eliminando producto ${id}:`, error);
    return false;
  }
};

// --- ACTUALIZAR STOCK (Venta) ---
export const updateStock = async (productId: string, quantityToSubtract: number): Promise<void> => {
  try {
    // 1. Obtener producto actual para ver el stock
    const product = await pb.collection(COLLECTION_NAME).getOne<Product>(productId);
    
    // 2. Calcular nuevo stock (sin bajar de 0)
    const newStock = Math.max(0, product.stock - quantityToSubtract);
    
    // 3. Actualizar solo el campo stock
    await pb.collection(COLLECTION_NAME).update(productId, { stock: newStock });
    
  } catch (error) {
    console.error(`Error actualizando stock para producto ${productId}:`, error);
  }
};

// --- FUNCIONES AUXILIARES DE FILTRADO ---
// Nota: Estas podrían optimizarse haciendo la query directo a la DB, 
// pero para mantener compatibilidad rápida filtraremos en memoria por ahora.

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    return await pb.collection(COLLECTION_NAME).getOne<Product>(id);
  } catch (error) {
    return null;
  }
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    return await pb.collection(COLLECTION_NAME).getFullList<Product>({
        filter: `category = "${category}"`
    });
  } catch (error) {
    return [];
  }
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    // Retornamos los primeros 6 productos como destacados
    return await pb.collection(COLLECTION_NAME).getList<Product>(1, 6, {
        sort: '-created'
    }).then(result => result.items);
  } catch (error) {
    return [];
  }
};