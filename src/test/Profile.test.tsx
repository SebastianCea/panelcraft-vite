import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '@/pages/Profile';
import * as authService from '@/lib/service/authenticateUser';
import * as userStorage from '@/lib/userStorage';
import React from 'react';

// --- MOCKS ---

// 1. Mock del Hook de Toast (shadcn/ui)
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: mockToast
    })
}));

// 2. Mock de Navigation (para probar redirección)
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
        
        // Spies por defecto (Usuario Autenticado)
        vi.spyOn(authService, 'getCurrentUser').mockReturnValue(mockUser as any);
        vi.spyOn(authService, 'login').mockImplementation(() => {});
        vi.spyOn(userStorage, 'updateUser').mockImplementation((id, updates) => ({ ...mockUser, ...updates } as any));
    });

    afterEach(() => {
        cleanup();
    });

    // --- TEST 1: RENDERIZADO Y CARGA DE DATOS ---
    test('1. Debe renderizar datos del usuario y llenar el formulario', async () => {
        render(<BrowserRouter><Profile /></BrowserRouter>);

        // Verificar Textos Fijos
        expect(screen.getByText('Usuario Prueba')).toBeDefined();
        expect(screen.getByText('11.111.111-1')).toBeDefined();
        
        // Usamos waitFor para esperar a que el useEffect llene el formulario
        await waitFor(() => {
            // Verificar inputs de texto
            expect(screen.getByDisplayValue('test@duocuc.cl')).toBeDefined();
            
            
        });
    });

    // --- TEST 2: REDIRECCIÓN (NO AUTENTICADO) ---
    test('2. Debe redirigir a /login si no hay usuario autenticado', () => {
        // Simulamos que no hay usuario
        vi.spyOn(authService, 'getCurrentUser').mockReturnValue(null);
        
        render(<BrowserRouter><Profile /></BrowserRouter>);
        
        // Verificamos redirección inmediata
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    // --- TEST 3: ACTUALIZACIÓN EXITOSA ---
    test('3. Flujo de actualización de perfil correcto', async () => {
        render(<BrowserRouter><Profile /></BrowserRouter>);

        // Esperamos a que cargue para poder editar
        await waitFor(() => screen.getByDisplayValue('test@duocuc.cl'));

        // 1. Modificar campos
        const emailInput = screen.getByDisplayValue('test@duocuc.cl');
        fireEvent.change(emailInput, { target: { value: 'nuevo@email.com' } });

        const passInput = screen.getByDisplayValue('Password123');
        fireEvent.change(passInput, { target: { value: 'Nueva1234' } });

        // Modificar fecha
        fireEvent.change(screen.getByPlaceholderText('Día'), { target: { value: '10' } });
        fireEvent.change(screen.getByPlaceholderText('Año'), { target: { value: '1999' } });
        
        // Seleccionar Mes
        const selects = screen.getAllByRole('combobox'); 
        fireEvent.change(selects[0], { target: { value: '5' } }); 

        // 2. Enviar Formulario
        const btn = screen.getByText('Guardar Cambios');
        fireEvent.click(btn);

        // 3. Validaciones Asíncronas
        await waitFor(() => {
            expect(userStorage.updateUser).toHaveBeenCalledWith('u1', expect.objectContaining({
                email: 'nuevo@email.com',
                password: 'Nueva1234',
                birthdate: '1999-05-10'
            }));

            expect(authService.login).toHaveBeenCalled();

            expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Perfil Actualizado'
            }));
        });
    });

    // --- TEST 4: ERROR EN ACTUALIZACIÓN ---
    test('4. Manejo de error si falla la actualización', async () => {
        // Forzamos fallo en el storage
        vi.spyOn(userStorage, 'updateUser').mockReturnValue(null);

        render(<BrowserRouter><Profile /></BrowserRouter>);
        
        // Esperar carga
        await waitFor(() => screen.getByDisplayValue('test@duocuc.cl'));

        // Click en guardar
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
