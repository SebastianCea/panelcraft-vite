import { demoUsers } from './usersData';
import { User } from '@/types/user';
import { demoProductsList } from './productsData';


// --- FUNCIÓN DE INICIALIZACIÓN DE DEMO (ACTUALIZADA) ---
export const initializeDemoData = () => {
  const USER_KEY = 'levelup_users';
  const PRODUCT_KEY = 'levelup_products'; // Nueva clave para productos

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


};