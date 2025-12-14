import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '@/pages/Profile';
import * as authService from '@/lib/service/authenticateUser';
import * as userStorage from '@/lib/userStorage';
import * as orderStorage from '@/lib/orderStorage'; // 🟢 Importante mockear esto también
import React from 'react';

// --- MOCKS ---

// 1. Mock del Hook de Toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: mockToast
    })
}));

// 2. Mock de Navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Vista Perfil - Cobertura Completa', () => {
    
    const mockUser = {
        id: 'u1',
        name: 'Usuario Prueba',
        email: 'test@duocuc.cl',
        rut: '11.111.111-1',
        birthdate: '2000-01-01',
        password: 'Password123',
        discountPercentage: 20,
        userType: 'Cliente',
        region: 'Metropolitana',
        comuna: 'Santiago',
        address: 'Calle Falsa 123',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Spies Auth & User
        vi.spyOn(authService, 'getCurrentUser').mockReturnValue(mockUser as any);
        
        // updateUser es async en el componente, usamos mockResolvedValue para simular éxito
        vi.spyOn(userStorage, 'updateUser').mockResolvedValue(mockUser as any);
        
        // Spy Orders (Necesario porque Profile carga órdenes al montar)
        // Devolvemos un array vacío para que no rompa la carga
        vi.spyOn(orderStorage, 'getOrders').mockResolvedValue([]); 
    });

    afterEach(() => {
        cleanup();
    });

    // --- TEST 1: RENDERIZADO Y CARGA DE DATOS ---
    test('1. Debe renderizar datos del usuario y llenar el formulario', async () => {
        render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Profile />
            </BrowserRouter>
        );

        // Verificar Textos Fijos
        expect(screen.getByText('Usuario Prueba')).toBeDefined();
        expect(screen.getByText('11.111.111-1')).toBeDefined();
        
        // Esperamos a que el formulario se llene (puede tomar un instante por el useEffect)
        await waitFor(() => {
            expect(screen.getByDisplayValue('test@duocuc.cl')).toBeDefined();
        });
    });

    // --- TEST 2: REDIRECCIÓN (NO AUTENTICADO) ---
    test('2. Debe redirigir a /login si no hay usuario autenticado', () => {
        vi.spyOn(authService, 'getCurrentUser').mockReturnValue(null);
        
        render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Profile />
            </BrowserRouter>
        );
        
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    // --- TEST 3: ACTUALIZACIÓN EXITOSA ---
    test('3. Flujo de actualización de perfil correcto', async () => {
        // Mockeamos la respuesta de update para reflejar los cambios simulados
        vi.spyOn(userStorage, 'updateUser').mockImplementation(async (id, updates) => ({
            ...mockUser,
            ...updates,
        } as any));

        render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Profile />
            </BrowserRouter>
        );

        // Esperar carga inicial
        await waitFor(() => screen.getByDisplayValue('test@duocuc.cl'));

        // 1. Modificar campos
        const emailInput = screen.getByDisplayValue('test@duocuc.cl');
        fireEvent.change(emailInput, { target: { value: 'nuevo@email.com' } });

        const passInput = screen.getByDisplayValue('Password123');
        fireEvent.change(passInput, { target: { value: 'Nueva1234' } });

        // Modificar fecha
        fireEvent.change(screen.getByPlaceholderText('Día'), { target: { value: '10' } });
        fireEvent.change(screen.getByPlaceholderText('Año'), { target: { value: '1999' } });
        
        // Seleccionar Mes (buscamos el select por su rol o etiqueta)
        const selects = screen.getAllByRole('combobox');
        if (selects.length > 0) {
             fireEvent.change(selects[0], { target: { value: '5' } });
        }

        // 2. Enviar Formulario
        const btn = screen.getByText('Guardar Cambios');
        fireEvent.click(btn);

        // 3. Validaciones Asíncronas
        await waitFor(() => {
            expect(userStorage.updateUser).toHaveBeenCalledWith('u1', expect.objectContaining({
                email: 'nuevo@email.com',
                password: 'Nueva1234',
                // Verificamos el formato de fecha: AAAA-MM-DD
                birthdate: '1999-05-10'
            }));

            expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Perfil Actualizado'
            }));
        });
    });

    // --- TEST 4: ERROR EN ACTUALIZACIÓN ---
    test('4. Manejo de error si falla la actualización', async () => {
        // Forzamos fallo en el storage devolviendo null (o lanzando error)
        vi.spyOn(userStorage, 'updateUser').mockResolvedValue(null);

        render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Profile />
            </BrowserRouter>
        );
        
        await waitFor(() => screen.getByDisplayValue('test@duocuc.cl'));

        const btn = screen.getByText('Guardar Cambios');
        fireEvent.click(btn);

        await waitFor(() => {
            expect(userStorage.updateUser).toHaveBeenCalled();
            expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Error',
                variant: 'destructive'
            }));
        });
    });
});