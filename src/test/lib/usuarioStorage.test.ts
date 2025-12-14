import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { getUsers, addUser, updateUser, deleteUser, getUserById } from '../../lib/userStorage';
import { UserFormData } from '@/types/user';

// --- MOCK DE POCKETBASE ---
const mockCollection = {
    getFullList: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getOne: vi.fn(),
};

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
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('addUser: Debería crear un usuario en la colección', async () => {
        const result = await addUser(MOCK_USER);
        expect(result.id).toBe('user-abc');
        expect(mockCollection.create).toHaveBeenCalledWith(expect.objectContaining({
            email: 'test@levelup.cl'
        }));
    });

    test('getUsers: Debería listar usuarios', async () => {
        const users = await getUsers();
        expect(users).toHaveLength(1);
        expect(users[0].name).toBe('Test User');
        expect(mockCollection.getFullList).toHaveBeenCalled();
    });

    test('getUserById: Debería obtener un usuario específico', async () => {
        const user = await getUserById('user-abc');
        expect(user).toBeDefined();
        expect(user?.rut).toBe(MOCK_USER.rut);
        expect(mockCollection.getOne).toHaveBeenCalledWith('user-abc');
    });

    test('updateUser: Debería actualizar datos del usuario', async () => {
        const updates = { name: 'Nombre Actualizado' };
        await updateUser('user-abc', updates);
        expect(mockCollection.update).toHaveBeenCalledWith('user-abc', expect.objectContaining(updates));
    });

    test('deleteUser: Debería eliminar el usuario', async () => {
        const result = await deleteUser('user-abc');
        expect(result).toBe(true);
        expect(mockCollection.delete).toHaveBeenCalledWith('user-abc');
    });

    test('Manejo de Error: getUsers falla', async () => {
        mockCollection.getFullList.mockRejectedValue(new Error('DB Error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await getUsers();
        
        expect(result).toEqual([]);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    test('Manejo de Error: deleteUser falla', async () => {
        mockCollection.delete.mockRejectedValue(new Error('No se pudo borrar'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await deleteUser('user-abc');
        
        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});