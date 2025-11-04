import { Product, ProductFormData } from '../types/product';

// Clave única para guardar los productos en el localStorage
const STORAGE_KEY = 'levelup_products';

// Función auxiliar para generar un ID simple (simulando una base de datos)
function makeProductId(): string {
  return 'prod-' + Math.random().toString(36).slice(2, 10);
}

/**
 * Recupera todos los productos guardados de localStorage.
 * @returns {Product[]} Arreglo de productos.
 */
export const getProducts = (): Product[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data) as Product[];
  } catch (error) {
    console.error("Error al parsear datos de productos:", error);
    return [];
  }
};

/**
 * Guarda el arreglo completo de productos en localStorage.
 * @param products El arreglo completo de productos a guardar.
 */
const saveProducts = (products: Product[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

/**
 * Crea un nuevo producto.
 * @param data Los datos del formulario (sin id ni image).
 */
export const addProduct = (data: ProductFormData): void => {
  const products = getProducts();
  
  const newProduct: Product = {
    ...data,
    id: makeProductId(),
    // En una app real, aquí manejarías la URL de la imagen.
    // Usamos un placeholder temporal por ahora.
    image: 'https://placehold.co/400x400/CCCCCC/000000?text=Placeholder', 
  };
  
  // Agrega el nuevo producto y guarda la lista actualizada
  saveProducts([newProduct, ...products]);
};

/**
 * Actualiza un producto existente.
 * @param id El ID del producto a actualizar.
 * @param data Los datos actualizados del formulario.
 */
export const updateProduct = (id: string, data: ProductFormData): void => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    throw new Error(`Producto con ID ${id} no encontrado.`);
  }

  const updatedProduct: Product = {
    ...products[index], // Mantiene la imagen y otros datos existentes
    ...data, // Sobrescribe con los nuevos datos del formulario
  };

  products[index] = updatedProduct;
  saveProducts(products);
};

/**
 * Elimina un producto por su ID.
 * @param id El ID del producto a eliminar.
 */
export const deleteProduct = (id: string): void => {
  const products = getProducts();
  const filteredProducts = products.filter(p => p.id !== id);
  saveProducts(filteredProducts);
};