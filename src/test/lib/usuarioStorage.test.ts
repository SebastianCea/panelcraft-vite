import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { getUsers, addUser, updateUser, deleteUser, getUserById, getUserByEmail } from '../../lib/userStorage';
import { UserFormData } from '@/types/user';

// --- MOCK DE POCKETBASE ---
// 1. Definimos el objeto mock con todas las funciones necesarias
const mockCollection = {
    getFullList: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getOne: vi.fn(),
    getFirstListItem: vi.fn(), // Necesario para getUserByEmail
};

// 2. Mockeamos la librería devolviendo siempre nuestro objeto mockCollection
vi.mock('@/lib/pocketbase', () => ({
    pb: {
        collection: vi.fn(() => mockCollection),
        autoCancellation: vi.fn(), 
    }
}));

// --- DATOS DE PRUEBA ---
const MOCK_USER: UserFormData = {
    rut: '11111111-1',
    name: 'Test User',
    email: 'test@levelup.cl',
    password: 'Password123',
    birthdate: '1990-01-01',
    userType: 'Cliente',
    address: 'Calle Falsa 123',
    region: 'Metropolitana',
    comuna: 'Santiago',
    discountPercentage: 0
};

const mockUserRecord = {
    id: 'user-abc',
    ...MOCK_USER,
    created: '2023-05-10',
    updated: '2023-05-10'
};

describe('userStorage - Cobertura Completa (PocketBase Mock)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        // Configurar respuestas exitosas por defecto
        mockCollection.getFullList.mockResolvedValue([mockUserRecord]);
        mockCollection.create.mockResolvedValue(mockUserRecord);
        mockCollection.update.mockResolvedValue({ ...mockUserRecord, name: 'Nombre Actualizado' });
        mockCollection.delete.mockResolvedValue(true);
        mockCollection.getOne.mockResolvedValue(mockUserRecord);
        mockCollection.getFirstListItem.mockResolvedValue(mockUserRecord);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // --- 1. TEST ADD USER ---
    test('addUser: Debería crear un usuario en la colección', async () => {
        const result = await addUser(MOCK_USER);
        expect(result.id).toBe('user-abc');
        expect(mockCollection.create).toHaveBeenCalledWith(expect.objectContaining({
            email: 'test@levelup.cl'
        }));
    });

    test('addUser: Debería lanzar error si falla la creación (Catch block)', async () => {
        mockCollection.create.mockRejectedValue(new Error('Create Error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        // Verificamos que lance el error hacia arriba
        await expect(addUser(MOCK_USER)).rejects.toThrow('Create Error');
        expect(consoleSpy).toHaveBeenCalled();
    });

    // --- 2. TEST GET USERS ---
    test('getUsers: Debería listar usuarios', async () => {
        const users = await getUsers();
        expect(users).toHaveLength(1);
        expect(users[0].name).toBe('Test User');
        expect(mockCollection.getFullList).toHaveBeenCalled();
    });

    test('getUsers: Debería retornar array vacío si falla (Catch block)', async () => {
        mockCollection.getFullList.mockRejectedValue(new Error('DB Error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await getUsers();
        
        expect(result).toEqual([]);
        expect(consoleSpy).toHaveBeenCalled();
    });

    // --- 3. TEST GET USER BY ID ---
    test('getUserById: Debería obtener un usuario específico', async () => {
        const user = await getUserById('user-abc');
        expect(user).toBeDefined();
        expect(user?.rut).toBe(MOCK_USER.rut);
        expect(mockCollection.getOne).toHaveBeenCalledWith('user-abc');
    });

    test('getUserById: Debería retornar null si falla (Catch block)', async () => {
        mockCollection.getOne.mockRejectedValue(new Error('Not found'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await getUserById('user-abc');
        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalled();
    });

    // --- 4. TEST UPDATE USER ---
    test('updateUser: Debería actualizar datos del usuario', async () => {
        const updates = { name: 'Nombre Actualizado' };
        await updateUser('user-abc', updates);
        expect(mockCollection.update).toHaveBeenCalledWith('user-abc', expect.objectContaining(updates));
    });

    test('updateUser: Debería lanzar error si falla (Catch block)', async () => {
        mockCollection.update.mockRejectedValue(new Error('Update Error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await expect(updateUser('user-abc', { name: 'Fail' })).rejects.toThrow('Update Error');
        expect(consoleSpy).toHaveBeenCalled();
    });

    // --- 5. TEST DELETE USER ---
    test('deleteUser: Debería eliminar el usuario', async () => {
        const result = await deleteUser('user-abc');
        expect(result).toBe(true);
        expect(mockCollection.delete).toHaveBeenCalledWith('user-abc');
    });

    test('deleteUser: Debería retornar false si falla (Catch block)', async () => {
        mockCollection.delete.mockRejectedValue(new Error('No se pudo borrar'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await deleteUser('user-abc');
        
        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalled();
    });

    // --- 6. TEST GET USER BY EMAIL (NUEVO) ---
    test('getUserByEmail: Debería obtener usuario por email', async () => {
        const result = await getUserByEmail('test@levelup.cl');
        expect(result).toEqual(mockUserRecord);
        expect(mockCollection.getFirstListItem).toHaveBeenCalledWith('email="test@levelup.cl"');
    });

    test('getUserByEmail: Debería retornar null si no encuentra o falla', async () => {
        mockCollection.getFirstListItem.mockRejectedValue(new Error('Email not found'));
        const result = await getUserByEmail('unknown@levelup.cl');
        expect(result).toBeNull();
    });
});