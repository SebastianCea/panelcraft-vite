import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '@/pages/Profile';
import * as authService from '@/lib/service/authenticateUser';
import * as userStorage from '@/lib/userStorage';
import * as orderStorage from '@/lib/orderStorage';
import { toast } from 'sonner';

// 🟢 SOLUCIÓN INFALIBLE: Importar jest-dom directamente aquí
import '@testing-library/jest-dom';

// --- MOCKS ---

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    }
}));

const mockToastFn = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: mockToastFn
    })
}));

// Mock de authenticateUser completo
vi.mock('@/lib/service/authenticateUser', () => ({
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    updateLocalSession: vi.fn(),
    hasAdminAccess: vi.fn().mockReturnValue(false), // Agregado para PublicHeader
}));

vi.mock('@/lib/userStorage', () => ({
    updateUser: vi.fn(),
}));

vi.mock('@/lib/orderStorage', () => ({
    getOrders: vi.fn(),
}));

describe('Vista Perfil - Cobertura Completa', () => {
    
    const mockUser = {
        id: 'u1',
        name: 'Usuario Test',
        rut: '12.345.678-9',
        email: 'test@duocuc.cl',
        password: 'Password123',
        birthdate: '1990-01-01',
        discountPercentage: 20
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
        
        (authService.getCurrentUser as any).mockReturnValue(mockUser);
        (orderStorage.getOrders as any).mockResolvedValue([]);
        (authService.hasAdminAccess as any).mockReturnValue(false);
    });

    afterEach(() => {
        cleanup();
    });

    const renderComponent = () => {
        render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Profile />
            </BrowserRouter>
        );
    };

    test('1. Renderizado inicial (Modo Lectura)', () => {
        renderComponent();

        expect(screen.getByText('Usuario Test')).toBeDefined();
        expect(screen.getByText('12.345.678-9')).toBeDefined();
        
        const emailInput = screen.getByDisplayValue('test@duocuc.cl');
        expect(emailInput).toBeDisabled(); // Ahora sí funcionará
        
        expect(screen.getByText(/Editar Datos/i)).toBeDefined();
    });

    test('2. Redirección si no hay usuario', () => {
        (authService.getCurrentUser as any).mockReturnValue(null);
        renderComponent();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('3. Flujo Exitoso: Habilitar edición, cambiar datos y guardar', async () => {
        (authService.login as any).mockResolvedValue({ success: true });
        
        const updatedUser = { ...mockUser, email: 'nuevo@email.com' };
        (userStorage.updateUser as any).mockResolvedValue(updatedUser);

        renderComponent();

        const editBtn = screen.getByText(/Editar Datos/i);
        fireEvent.click(editBtn);

        const emailInput = screen.getByDisplayValue('test@duocuc.cl');
        expect(emailInput).not.toBeDisabled();

        fireEvent.change(emailInput, { target: { value: 'nuevo@email.com' } });

        const passwordInput = screen.getByPlaceholderText(/Ingresa tu contraseña para guardar/i);
        fireEvent.change(passwordInput, { target: { value: 'Password123' } });

        const saveBtn = screen.getByText(/Guardar Todo/i);
        await act(async () => {
            fireEvent.click(saveBtn);
        });

        await waitFor(() => {
            expect(authService.login).toHaveBeenCalledWith({
                email: 'test@duocuc.cl',
                password: 'Password123'
            });
            
            expect(userStorage.updateUser).toHaveBeenCalledWith('u1', expect.objectContaining({
                email: 'nuevo@email.com'
            }));

            expect(mockToastFn).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Perfil Actualizado'
            }));
        });
    });

    test('4. Flujo Fallido: Contraseña actual incorrecta', async () => {
        (authService.login as any).mockResolvedValue({ success: false });

        renderComponent();

        fireEvent.click(screen.getByText(/Editar Datos/i));

        const passwordInput = screen.getByPlaceholderText(/Ingresa tu contraseña para guardar/i);
        fireEvent.change(passwordInput, { target: { value: 'WrongPass' } });

        await act(async () => {
            fireEvent.click(screen.getByText(/Guardar Todo/i));
        });

        await waitFor(() => {
            expect(mockToastFn).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Error de Seguridad',
                variant: 'destructive'
            }));
            
            expect(userStorage.updateUser).not.toHaveBeenCalled();
        });
    });

    test('5. Cancelar Edición', () => {
        renderComponent();

        fireEvent.click(screen.getByText(/Editar Datos/i));
        
        const emailInput = screen.getByDisplayValue('test@duocuc.cl');
        fireEvent.change(emailInput, { target: { value: 'borrador@email.com' } });

        const cancelBtn = screen.getByText(/Cancelar/i);
        fireEvent.click(cancelBtn);

        expect(screen.getByDisplayValue('test@duocuc.cl')).toBeDisabled();
        expect(screen.queryByText(/Guardar Todo/i)).toBeNull();
    });
});