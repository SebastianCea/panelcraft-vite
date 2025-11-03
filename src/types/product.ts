export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'consolas' | 'computadores' | 'accesorios' | 'juegos-mesa' | 'ropa';
  description?: string;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
