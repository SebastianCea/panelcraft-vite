import { pb } from '@/lib/pocketbase';
import { User } from '@/types/user';

// Nombre de la colección en PocketBase
const COLLECTION_NAME = 'users';

export const getUsers = async (): Promise<User[]> => {
  try {
    const records = await pb.collection(COLLECTION_NAME).getFullList<User>({
      sort: '-created',
    });
    return records;
  } catch (error) {
    console.error('Error cargando usuarios desde PocketBase:', error);
    return [];
  }
};

export const addUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
  try {
    const record = await pb.collection(COLLECTION_NAME).create<User>(userData);
    return record;
  } catch (error) {
    console.error('Error creando usuario en PocketBase:', error);
    throw error;
  }
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User | null> => {
  try {
    // 🟢 Asegúrate de que userData no tenga campos undefined
    const cleanData = Object.fromEntries(
        Object.entries(userData).filter(([_, v]) => v !== undefined && v !== '')
    );

    const record = await pb.collection(COLLECTION_NAME).update<User>(id, cleanData);
    return record;
  } catch (error) {
    // 🟢 Loguea el error completo para depurar
    console.error(`Error actualizando usuario ${id}:`, error);
    // Puedes lanzar el error para capturarlo en el componente y ver el mensaje real
    throw error; 
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    await pb.collection(COLLECTION_NAME).delete(id);
    return true;
  } catch (error) {
    console.error(`Error eliminando usuario ${id}:`, error);
    return false;
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const record = await pb.collection(COLLECTION_NAME).getOne<User>(id);
    return record;
  } catch (error) {
    console.error(`Error obteniendo usuario ${id}:`, error);
    return null;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const record = await pb.collection(COLLECTION_NAME).getFirstListItem<User>(`email="${email}"`);
    return record;
  } catch (error) {
    return null;
  }
};