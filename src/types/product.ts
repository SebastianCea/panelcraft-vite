export interface Product {
  // Campos de sistema de PocketBase (Opcionales para lectura, prohibidos para escritura)
  id: string;
  collectionId?: string;
  collectionName?: string;
  created?: string;
  updated?: string;

  // Campos de Datos
  name: string;
  price: number;
  // Aseguramos que category sea uno de los valores permitidos o string genérico si es necesario
  category: 'consolas' | 'computadores' | 'accesorios' | 'juegos-mesa' | 'ropa' | string;
  description: string;
  stock: number;
  minStock: number;
  image: string;

  // Campos de compatibilidad (mapeados desde created/updated si es necesario)
  createdAt?: string;
  updatedAt?: string;
}

// 🟢 CORRECCIÓN: ProductFormData excluye explícitamente los campos de sistema
export type ProductFormData = Omit<
  Product, 
  'id' | 'collectionId' | 'collectionName' | 'created' | 'updated' | 'createdAt' | 'updatedAt'
>;

// Tipo auxiliar para el ítem del carrito
export interface CartItem {
  product: Product;
  quantity: number;
}