import { User } from "@/types/user";

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
