import { demoUsers } from './usersData';
import { User } from '@/types/user';
import { demoProductsList } from './productsData';
import {demoOrders} from './ordersData'


// --- FUNCIÓN DE INICIALIZACIÓN DE DEMO (ACTUALIZADA) ---
export const initializeDemoData = () => {
  const USER_KEY = 'levelup_users';
  const PRODUCT_KEY = 'levelup_products'; // Nueva clave para productos
  const ORDER_KEY = 'levelup_orders'; // 💡 Clave para Órdenes

  // 1. Inicializar Usuarios 
  const existingUsers = localStorage.getItem(USER_KEY);
  if (!existingUsers || JSON.parse(existingUsers).length === 0) {
    const users: User[] = demoUsers.map((user, index) => ({
      ...user,
      id: `demo-u-${index + 1}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    localStorage.setItem(USER_KEY, JSON.stringify(users));
  }

  // 2. Inicializar Productos (NUEVO BLOQUE)
  // Usamos demoProductsList (la lista completa que me enviaste)
  const existingProducts = localStorage.getItem(PRODUCT_KEY);
  if (!existingProducts || JSON.parse(existingProducts).length === 0) {
    // Almacenamos la lista completa de productos directamente
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(demoProductsList));
  }

  //3. Inicializar Ordenes
  // 💡 VERIFICACIÓN: Usamos localStorage.getItem() con la clave de Órdenes
 const existingOrders = localStorage.getItem(ORDER_KEY);
 
 // 💡 GUARDADO: Si no existe (o está vacío), guardamos los datos demo de órdenes
 if (!existingOrders || JSON.parse(existingOrders).length === 0) {
  localStorage.setItem(ORDER_KEY, JSON.stringify(demoOrders));
  console.log('Órdenes demo inicializadas en localStorage.');
 }


};