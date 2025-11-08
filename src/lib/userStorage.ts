import { User } from '@/types/user';

const STORAGE_KEY = 'levelup_users';

export const getUsers = (): User[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
};

export const saveUsers = (users: User[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

export const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User => {
  const users = getUsers();
  const newUser: User = {
    ...userData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveUsers([...users, newUser]);
  return newUser;
};

export const updateUser = (id: string, userData: Partial<User>): User | null => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;
  
  const updatedUser = {
    ...users[index],
    ...userData,
    updatedAt: new Date().toISOString(),
  };
  users[index] = updatedUser;
  saveUsers(users);
  return updatedUser;
};

export const deleteUser = (id: string): boolean => {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== id);
  if (filtered.length === users.length) return false;
  saveUsers(filtered);
  return true;
};

export const getUserById = (id: string): User | null => {
  const users = getUsers();
  return users.find(u => u.id === id) || null;
};
