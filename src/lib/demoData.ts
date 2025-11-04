import { User } from '@/types/user';
import { Product } from '@/types/product'; // Importamos el tipo Producto

// --- DATOS DE USUARIOS (EXISTENTE) ---
export const demoUsers: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // ... (tus datos de Pablo Neruda, Víctor Jara, etc.)
  {
    rut: '12345678-9',
    name: 'Pablo Neruda',
    email: 'pablito@levelup.cl',
    birthdate: '1904-07-12',
    userType: 'Cliente',
    address: 'Calle Falsa 123, Concepción',
  },
  {
    rut: '43434312-1',
    name: 'Víctor Jara',
    email: 'victor.jara@levelup.cl',
    birthdate: '1932-09-28',
    userType: 'Vendedor',
    address: 'Avenida Siempreviva 742, Santiago',
  },
  {
    rut: '98765432-1',
    name: 'Gabriela Mistral',
    email: 'gmistral@levelup.cl',
    birthdate: '1889-04-07',
    userType: 'Administrador',
    address: 'Paseo Bulnes 456, Valparaíso',
  },
];

// --- DATOS DE PRODUCTOS (LISTA COMPLETA DE TU ARCHIVO products.ts) ---
// NOTA: Para evitar conflictos, he renombrado la exportación original 'products' a 'demoProductsList'
export const demoProductsList: Product[] = [
  // Juegos de Mesa
  {
    id: 'catan-jdm',
    name: 'Juegos de Mesa Catan',
    price: 29990,
    image: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400',
    category: 'juegos-mesa',
    description: 'El clásico juego de estrategia para toda la familia',
    stock: 15,
  },
  {
    id: 'carcassonne-jdm',
    name: 'Juegos de Mesa Carcassonne',
    price: 24990,
    image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400',
    category: 'juegos-mesa',
    description: 'Construye tu ciudad medieval',
    stock: 12,
  },
  
  // Accesorios
  {
    id: 'xbox-ctrl',
    name: 'Controlador Inalámbrico Xbox Series X',
    price: 59990,
    image: 'https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=400',
    category: 'accesorios',
    description: 'Control oficial de Xbox con conexión inalámbrica',
    stock: 25,
  },
  {
    id: 'hyperx-hset',
    name: 'Auriculares Gamer HyperX Cloud II',
    price: 79990,
    image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=400',
    category: 'accesorios',
    description: 'Audio profesional para gaming',
    stock: 18,
  },
  {
    id: 'logitech-g502',
    name: 'Mouse Gamer Logitech G502',
    price: 49990,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    category: 'accesorios',
    description: 'Precisión y comodidad para largas sesiones',
    stock: 30,
  },
  {
    id: 'razer-mousepad',
    name: 'Mousepad Razer Goliathus Extended',
    price: 24990,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400',
    category: 'accesorios',
    description: 'Superficie extendida para mouse y teclado',
    stock: 20,
  },
  
  // Consolas
  {
    id: 'ps5-console',
    name: 'PlayStation 5',
    price: 549990,
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400',
    category: 'consolas',
    description: 'La consola de nueva generación de Sony',
    stock: 8,
  },
  {
    id: 'xbox-series-x',
    name: 'Xbox Series X',
    price: 499990,
    image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400',
    category: 'consolas',
    description: 'Potencia y rendimiento sin límites',
    stock: 10,
  },
  {
    id: 'switch-oled',
    name: 'Nintendo Switch OLED',
    price: 349990,
    image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400',
    category: 'consolas',
    description: 'Pantalla OLED vibrante y mayor almacenamiento',
    stock: 15,
  },
  
  // Computadores
  {
    id: 'gaming-pc-rtx',
    name: 'PC Gamer RTX 4070',
    price: 1299990,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
    category: 'computadores',
    description: 'Setup completo para gaming en 4K',
    stock: 5,
  },
  {
    id: 'laptop-asus-rog',
    name: 'Laptop ASUS ROG Strix G15',
    price: 1499990,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',
    category: 'computadores',
    description: 'Portátil gamer con RTX 4060',
    stock: 7,
  },
  
  // Ropa
  {
    id: 'tshirt-levelup',
    name: 'Polera Level-Up Gamer',
    price: 19990,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    category: 'ropa',
    description: 'Polera oficial Level-Up de algodón premium',
    stock: 50,
  },
  {
    id: 'hoodie-gaming',
    name: 'Polerón Gaming Pro',
    price: 34990,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
    category: 'ropa',
    description: 'Comodidad para maratones de gaming',
    stock: 35,
  },
];


// --- FUNCIÓN DE INICIALIZACIÓN DE DEMO (ACTUALIZADA) ---
export const initializeDemoData = () => {
  const USER_KEY = 'levelup_users';
  const PRODUCT_KEY = 'levelup_products'; // Nueva clave para productos

  // 1. Inicializar Usuarios (Lógica existente)
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
};