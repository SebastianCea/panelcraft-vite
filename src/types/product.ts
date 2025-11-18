export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'consolas' | 'computadores' | 'accesorios' | 'juegos-mesa' | 'ropa';
  description?: string;
  stock: number;
  minStock: number;

      // 💡 CAMPOS AÑADIDOS
    createdAt: string; // Timestamp de creación
    updatedAt: string; // 🟢 TIMESTAMP DE ACTUALIZACIÓN (Elimina el error)
}



export interface CartItem {
  product: Product;
  quantity: number;

  
}


// Este es el tipo de datos que se enviará desde el formulario
export type ProductFormData = Omit<Product, 'id'>;