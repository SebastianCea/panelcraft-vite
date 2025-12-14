import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '@/pages/Login';
import * as authService from '@/lib/service/authenticateUser';

// --- MOCKS ---
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: mockToast
    })
}));

vi.mock('@/lib/service/authenticateUser', () => ({
    login: vi.fn(),
}));

describe('Vista Login - Cobertura Completa', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        // 🟢 Usamos RELOJ REAL para evitar bloqueos con las promesas del formulario
        vi.useRealTimers();
    });

    afterEach(() => {
        cleanup();
    });

    const renderComponent = () => {
        render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Login />
            </BrowserRouter>
        );
    };

    // 🟢 DATOS QUE SÍ PASAN TU VALIDACIÓN (según logs de error anteriores)
    const VALID_EMAIL = 'admin@duocuc.cl'; 
    const VALID_PASS = 'Password123';

    test('1. Renderizado inicial correcto', () => {
        renderComponent();
        expect(screen.getByRole('heading', { name: /Iniciar Sesión/i })).toBeDefined();
        expect(screen.getByLabelText(/Correo Electrónico/i)).toBeDefined();
        expect(screen.getByLabelText(/Contraseña/i)).toBeDefined();
        expect(screen.getByRole('button', { name: /Ingresar/i })).toBeDefined();
    });

    test('2. Login Exitoso - Redirección Admin (Loading y Navegación)', async () => {
        // Simulamos retardo de red de 300ms para asegurar que se vea el "Conectando..."
        (authService.login as any).mockImplementation(() => new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true, user: { name: 'Admin', userType: 'Administrador' } });
            }, 300);
        }));

        renderComponent();

        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: VALID_EMAIL } });
        fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: VALID_PASS } });
        
        // Click en Ingresar
        fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

        // 1. Verificamos estado de carga (waitFor maneja la micro-espera de React)
        await waitFor(() => {
            expect(screen.getByText(/Conectando.../i)).toBeDefined();
        });

        // 2. Esperamos el Toast (indica que terminó el login)
        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
                title: expect.stringContaining('Admin'),
                className: expect.stringContaining('bg-green-600')
            }));
        }, { timeout: 2000 }); 

        // 3. Esperamos la redirección 
        // IMPORTANTE: El componente espera 1000ms. Damos 3000ms de margen al test.
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/admin');
        }, { timeout: 3000 });
    });

    test('3. Login Exitoso - Redirección Cliente', async () => {
        (authService.login as any).mockResolvedValue({
            success: true,
            user: { name: 'Cliente', userType: 'Cliente' }
        });

        renderComponent();

        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: VALID_EMAIL } });
        fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: VALID_PASS } });
        fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

        // Esperamos redirección (timeout generoso por el setTimeout del componente)
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/home');
        }, { timeout: 3000 });
    });

    test('4. Login Fallido - Credenciales incorrectas', async () => {
        (authService.login as any).mockResolvedValue({
            success: false,
            message: 'Credenciales inválidas'
        });

        renderComponent();

        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: VALID_EMAIL } });
        fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: VALID_PASS } });
        fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Acceso Denegado',
                description: 'Credenciales inválidas', 
                variant: 'destructive'
            }));
        });
    });

    test('5. Login Error - Excepción en servicio', async () => {
        (authService.login as any).mockRejectedValue(new Error('Error de red'));

        renderComponent();

        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: VALID_EMAIL } });
        fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: VALID_PASS } });
        fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Acceso Denegado',
                description: 'Error de red',
                variant: 'destructive'
            }));
        });
    });
});