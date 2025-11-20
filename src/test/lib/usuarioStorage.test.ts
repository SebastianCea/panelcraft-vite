import { test, expect, describe, beforeEach, afterEach, vi } from 'vitest';
import { getUsers, addUser, updateUser, deleteUser, getUserById } from '../../lib/userStorage'; 
import { User, UserFormData } from '@/types/user'; 

//  1. MOCK DE DATOS DE ENTRADA (UserFormData)
// Utilizamos datos válidos que el formulario de registro enviaría.
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

//  2. MOCK DE DATOS DE USUARIO EXISTENTE (Para simular la base de datos)
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


// 💡 3. Aislamiento: Limpiar localStorage antes de cada prueba.
beforeEach(() => {
    localStorage.clear();
    // Ejecutamos add user directamente para iniciar la base con un usuario conocido.
    addUser(MOCK_EXISTING_USER);
});


describe('userStorage - Pruebas Unitarias de Lógica CRUD', () => {

    // --- PRUEBA 1: Creación de Usuario (addUser) ---
    test('1. Debería añadir un nuevo usuario y verificar la generación de metadatos', () => {
        // Arrange: El beforeEach ya tiene un usuario.
        const initialCount = getUsers().length;

        // Act: Añadir un segundo usuario
        const addedUser = addUser(MOCK_NEW_USER_DATA);

        // Assert:
        const updatedUsers = getUsers();

        // A. El conteo debe aumentar
        expect(updatedUsers.length).toBe(initialCount + 1);

        // B. El nuevo usuario debe tener un ID único y un userType correcto
        expect(addedUser.id).toBeTypeOf('string');
        expect(addedUser.userType).toBe('Cliente');
        
        // C. Los metadatos (createdAt/updatedAt) deben ser cadenas de fecha válidas
        expect(addedUser.createdAt).toBeTypeOf('string');
        expect(addedUser.updatedAt).toBeTypeOf('string');
    });

    // --- PRUEBA 2: Actualización de Usuario (updateUser) ---
    test('2. Debería actualizar un campo específico de un usuario existente (Ej: Nombre)', () => {
        // Arrange: Obtener el usuario existente creado en beforeEach
        const users = getUsers();
        const targetUser = users.find(u => u.rut === MOCK_EXISTING_USER.rut);
        const newName = 'Admin Modificado';

        // Act: Actualizar solo el campo 'name'
        const updatedUser = updateUser(targetUser!.id, { name: newName });
        
        // Assert:
        const finalUser = getUserById(targetUser!.id);

        // A. El nombre debe haber cambiado
        expect(finalUser?.name).toBe(newName);

        // B. La fecha de actualización debe ser más reciente (o al menos existir)
        expect(finalUser?.updatedAt).not.toBe(targetUser!.updatedAt);
        expect(finalUser?.updatedAt).toBeTypeOf('string');
    });
    
    // --- PRUEBA 3: Eliminación de Usuario (deleteUser) ---
    test('3. Debería eliminar un usuario existente y reducir el conteo', () => {
        // Arrange: Obtener el usuario existente
        const initialUsers = getUsers();
        const initialCount = initialUsers.length;
        const targetUser = initialUsers.find(u => u.rut === MOCK_EXISTING_USER.rut);

        // Act: Intentar eliminarlo
        const success = deleteUser(targetUser!.id);

        // Assert:
        const finalCount = getUsers().length;

        // A. La operación debe ser exitosa
        expect(success).toBe(true);

        // B. El conteo debe reducirse en uno
        expect(finalCount).toBe(initialCount - 1);
        
        // C. Intentar buscarlo debe devolver null
        expect(getUserById(targetUser!.id)).toBeNull();
    });
    
});