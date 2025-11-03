export interface User {
  id: string;
  rut: string;
  name: string;
  email: string;
  birthdate: string;
  userType: 'Cliente' | 'Vendedor' | 'Administrador';
  address: string;
  createdAt: string;
  updatedAt: string;
}

export type UserFormData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
