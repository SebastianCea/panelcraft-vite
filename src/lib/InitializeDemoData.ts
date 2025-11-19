import { demoUsers } from './usersData';
import { User } from '@/types/user';
import { demoProductsList } from './productsData';
import { demoOrders } from './ordersData';

export const initializeDemoData = () => {
  const USER_KEY = 'levelup_users';
  const PRODUCT_KEY = 'levelup_products';
  const ORDER_KEY = 'levelup_orders';

  // --- 1. Inicializar Usuarios (LÓGICA MEJORADA: FUSIÓN) ---
  const storedUsers = localStorage.getItem(USER_KEY);
  let currentUsers: User[] = storedUsers ? JSON.parse(storedUsers) : [];
  let usersUpdated = false;

  // Recorremos los usuarios demo del archivo y verificamos si faltan en el localStorage
  demoUsers.forEach((dUser, index) => {
    const exists = currentUsers.some(u => u.email.toLowerCase() === dUser.email.toLowerCase());

    if (!exists) {
        // Si no existe, lo agregamos
        const newUser: User = {
            ...dUser,
            id: `demo-user-${index + 1}`, // ID fijo para demos
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // Aseguramos que tenga el campo nuevo (aunque sea 0)
            discountPercentage: 0 
        };
        currentUsers.push(newUser);
        usersUpdated = true;
    }
  });

  // Solo guardamos si hubo cambios (para no sobrescribir innecesariamente)
  if (usersUpdated || currentUsers.length === 0) {
    localStorage.setItem(USER_KEY, JSON.stringify(currentUsers));
    console.log('✅ Usuarios demo cargados/fusionados exitosamente.');
  }


  // --- 2. Inicializar Productos ---
  const existingProducts = localStorage.getItem(PRODUCT_KEY);
  if (!existingProducts || JSON.parse(existingProducts).length === 0) {
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(demoProductsList));
    console.log('✅ Productos demo inicializados.');
  }


  // --- 3. Inicializar Órdenes ---
  const existingOrders = localStorage.getItem(ORDER_KEY);
  if (!existingOrders || JSON.parse(existingOrders).length === 0) {
    localStorage.setItem(ORDER_KEY, JSON.stringify(demoOrders));
    console.log('✅ Órdenes demo inicializadas.');
  }
};