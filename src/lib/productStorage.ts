import { Product, ProductFormData, CartItem } from '../types/product';

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
 * 🟢 NUEVA FUNCIÓN CLAVE: Actualiza el stock de un producto después de una venta.
 * @param productId ID del producto a actualizar.
 * @param quantityToSubtract Cantidad a restar del stock.
 */
export const updateStock = (productId: string, quantityToSubtract: number): void => {
    let products = getProducts();
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex === -1) {
        console.warn(`Producto con ID ${productId} no encontrado para actualizar stock.`);
        return;
    }

    const currentProduct = products[productIndex];
    const newStock = currentProduct.stock - quantityToSubtract;

    if (newStock < 0) {
        console.error(`ERROR DE STOCK: Intento de dejar el stock de ${currentProduct.name} en negativo.`);
        // Prevenir stock negativo y dejarlo en 0.
        currentProduct.stock = 0; 
    } else {
        currentProduct.stock = newStock;
    }

    // Actualiza el producto en el array
    products[productIndex] = { ...currentProduct, updatedAt: new Date().toISOString() };
    
    // Guarda el array completo de vuelta
    saveProducts(products);
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



//CATALOGO
export const getProductById = (id: string): Product | undefined => {
  const products = getProducts(); 
  return products.find(p => p.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  const products = getProducts(); 
  return products.filter(p => p.category === category);
};

export const getFeaturedProducts = (): Product[] => {
  const products = getProducts(); 
  // Simplemente devuelve los primeros 6 productos disponibles
  return products.slice(0, 6);
};
