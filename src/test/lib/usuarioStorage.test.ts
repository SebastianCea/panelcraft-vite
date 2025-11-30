import { test, expect, describe, beforeEach, afterEach, vi } from 'vitest';
import { getUsers, addUser, updateUser, deleteUser, getUserById, saveUsers } from '../../lib/userStorage'; 
import { User, UserFormData } from '@/types/user'; 

//  1. MOCK DE DATOS
const MOCK_NEW_USER_DATA: UserFormData = {
    rut: '11111111-1',
    name: 'Test Nuevo',
    email: 'test.nuevo@levelup.cl',
    password: 'SecurePassword1234',
    birthdate: '1990-01-01',
    userType: 'Cliente',
    address: 'Calle Falsa 123',
    region: 'Metropolitana',
    comuna: 'Santiago'
};

const MOCK_EXISTING_USER: UserFormData = {
    rut: '99999999-9',
    name: 'Existing Admin',
    email: 'admin.test@levelup.admin.cl',
    password: 'AdminPassword',
    birthdate: '1980-01-01',
    userType: 'Administrador',
    address: 'Central Admin 100',
    region: 'Metropolitana',
    comuna: 'Providencia'
};

describe('userStorage - Cobertura Completa', () => {

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        // Inicializamos con un usuario para las pruebas estándar
        addUser(MOCK_EXISTING_USER);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // --- BLOQUE 1: FUNCIONALIDAD CRUD (Happy Path) ---
    describe('Pruebas Unitarias de Lógica CRUD', () => {
        test('1. addUser: Debería añadir un nuevo usuario', () => {
            const initialCount = getUsers().length;
            const addedUser = addUser(MOCK_NEW_USER_DATA);
            const updatedUsers = getUsers();

            expect(updatedUsers.length).toBe(initialCount + 1);
            expect(addedUser.id).toBeTypeOf('string');
            expect(addedUser.userType).toBe('Cliente');
        });

        test('2. updateUser: Debería actualizar un usuario existente', async () => {
            const users = getUsers();
            const targetUser = users.find(u => u.rut === MOCK_EXISTING_USER.rut);
            const newName = 'Admin Modificado';

            // Pausa para asegurar cambio de timestamp
            await new Promise((resolve) => setTimeout(resolve, 10));

            updateUser(targetUser!.id, { name: newName });
            
            const finalUser = getUserById(targetUser!.id);
            expect(finalUser?.name).toBe(newName);
            expect(finalUser?.updatedAt).not.toBe(targetUser!.updatedAt);
        });

        test('3. updateUser: Debería retornar null si el usuario no existe', () => {
            const result = updateUser('id-inexistente', { name: 'Nadie' });
            expect(result).toBeNull();
        });
        
        test('4. deleteUser: Debería eliminar un usuario existente', () => {
            const users = getUsers();
            const targetUser = users.find(u => u.rut === MOCK_EXISTING_USER.rut);

            const success = deleteUser(targetUser!.id);
            expect(success).toBe(true);
            expect(getUserById(targetUser!.id)).toBeNull();
        });

        test('5. deleteUser: Debería retornar false si el id no existe', () => {
            const success = deleteUser('id-fantasma');
            expect(success).toBe(false);
        });
    });

    // --- BLOQUE 2: MANEJO DE ERRORES (Cubrir líneas 10-12 y 19-20) ---
    describe('Manejo de Errores (LocalStorage)', () => {
        
        test('getUsers: Debe manejar error al leer localStorage (Catch Block)', () => {
            // 1. Forzamos que localStorage.getItem lance un error
            const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
                throw new Error('Error de lectura simulado');
            });
            
            // 2. Espiamos console.error para verificar que se loguea el error pero no crashea
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            // 3. Ejecutamos
            const result = getUsers();

            // 4. Verificaciones
            expect(result).toEqual([]); // Debe retornar array vacío por defecto
            expect(consoleSpy).toHaveBeenCalledWith('Error loading users:', expect.any(Error));

            getItemSpy.mockRestore();
        });

        test('saveUsers: Debe manejar error al escribir en localStorage (Catch Block)', () => {
            // 1. Forzamos que localStorage.setItem lance un error (ej: cuota excedida)
            const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('QuotaExceededError');
            });
            
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            // 2. Ejecutamos saveUsers (directamente o vía addUser)
            // Intentamos guardar una lista vacía o cualquier dato
            saveUsers([]);

            // 3. Verificaciones
            expect(consoleSpy).toHaveBeenCalledWith('Error saving users:', expect.any(Error));

            setItemSpy.mockRestore();
        });
    });
});
