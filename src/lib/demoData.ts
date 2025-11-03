import { User } from '@/types/user';

export const demoUsers: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [
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

export const initializeDemoData = () => {
  const STORAGE_KEY = 'levelup_users';
  const existing = localStorage.getItem(STORAGE_KEY);
  
  if (!existing || JSON.parse(existing).length === 0) {
    const users: User[] = demoUsers.map((user, index) => ({
      ...user,
      id: `demo-${index + 1}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }
};
