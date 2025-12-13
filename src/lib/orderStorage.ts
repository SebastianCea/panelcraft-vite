import { Order } from '@/types/order';

const ORDER_KEY = 'levelup_orders';

export const getOrders = (): Order[] => {
  const data = localStorage.getItem(ORDER_KEY);
  return data ? JSON.parse(data) : [];
};

export const addOrder = (order: Omit<Order, 'id'>): Order => {
  const orders = getOrders();
  const newOrder: Order = {
    ...order,
    id: crypto.randomUUID(), // Generar ID único
  };
  
  // Agregar al inicio
  const updatedOrders = [newOrder, ...orders];
  localStorage.setItem(ORDER_KEY, JSON.stringify(updatedOrders));
  
  return newOrder;
};

// 🟢 ESTA FUNCIÓN FALTABA Y CAUSABA EL ERROR DE IMPORTACIÓN
export const updateOrder = (orderId: string, updates: Partial<Order>) => {
    const orders = getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    
    if (index !== -1) {
        const updatedOrder = { ...orders[index], ...updates };
        orders[index] = updatedOrder;
        localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
        return updatedOrder;
    }
    return null;
};