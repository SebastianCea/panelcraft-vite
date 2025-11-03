import { CartItem } from '@/types/product';

const CART_KEY = 'levelup_cart';

export const getCart = (): CartItem[] => {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading cart:', error);
    return [];
  }
};

export const saveCart = (cart: CartItem[]): void => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
};

export const addToCart = (item: CartItem): void => {
  const cart = getCart();
  const existingIndex = cart.findIndex(i => i.product.id === item.product.id);
  
  if (existingIndex > -1) {
    cart[existingIndex].quantity += item.quantity;
  } else {
    cart.push(item);
  }
  
  saveCart(cart);
};

export const removeFromCart = (productId: string): void => {
  const cart = getCart();
  const filtered = cart.filter(item => item.product.id !== productId);
  saveCart(filtered);
};

export const updateQuantity = (productId: string, quantity: number): void => {
  const cart = getCart();
  const item = cart.find(i => i.product.id === productId);
  
  if (item) {
    item.quantity = quantity;
    saveCart(cart);
  }
};

export const clearCart = (): void => {
  saveCart([]);
};

export const getCartTotal = (): number => {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
};

export const getCartCount = (): number => {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
};
