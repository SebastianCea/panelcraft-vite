import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '@/pages/Register';
import * as userStorage from '@/lib/userStorage';

// --- MOCKS ---

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// 🟢 MOCK DEL HOOK useToast (Lo que realmente usa el componente)
const mockToastFn = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: mockToastFn
    })
}));

vi.mock('@/lib/userStorage', () => ({
    addUser: vi.fn(),
}));

vi.mock('@/components/ui/select', () => {
    return {
        Select: ({ onValueChange, value, children }: any) => (
            <div data-testid="select-wrapper">
                <input 
                    data-testid="select-input"
                    value={value} 
                    onChange={(e) => onValueChange(e.target.value)} 
                />
                {children}
            </div>
        ),
        SelectContent: ({ children }: any) => <div>{children}</div>,
        SelectItem: ({ value }: any) => <option value={value}>{value}</option>,
        SelectTrigger: ({ children }: any) => <div>{children}</div>,
        SelectValue: () => <span>Valor</span>,
    };
});

describe('Vista Registro - Cobertura Completa', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    afterEach(() => {
        cleanup();
    });

    const renderComponent = () => {
        render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <RegisterPage />
            </BrowserRouter>
        );
    };

    const fillForm = async () => {
        fireEvent.change(screen.getByPlaceholderText(/Juan/i), { target: { value: 'Usuario' } });
        fireEvent.change(screen.getByPlaceholderText(/Pérez/i), { target: { value: 'Test' } });
        fireEvent.change(screen.getByPlaceholderText(/12345678-9/i), { target: { value: '11.111.111-1' } });
        
        fireEvent.change(screen.getByPlaceholderText('DD'), { target: { value: '01' } });
        fireEvent.change(screen.getByPlaceholderText('AAAA'), { target: { value: '1990' } });

        fireEvent.change(screen.getByPlaceholderText(/correo@ejemplo.com/i), { target: { value: 'nuevo@duocuc.cl' } });
        
        const passInputs = screen.getAllByLabelText(/contraseña \*/i);
        fireEvent.change(passInputs[0], { target: { value: 'Password123!' } });
        fireEvent.change(passInputs[1], { target: { value: 'Password123!' } });

        fireEvent.change(screen.getByPlaceholderText(/Av. Principal/i), { target: { value: 'Calle Falsa 123' } });

        const selectInputs = screen.getAllByTestId('select-input');
        if (selectInputs[0]) fireEvent.change(selectInputs[0], { target: { value: '1' } });
        if (selectInputs[1]) fireEvent.change(selectInputs[1], { target: { value: 'Región Metropolitana' } });
        if (selectInputs[2]) fireEvent.change(selectInputs[2], { target: { value: 'Santiago' } });
    };

    test('1. Renderizado inicial de campos', () => {
        renderComponent();
        expect(screen.getByRole('heading', { name: /Crear Cuenta/i })).toBeDefined();
    });

    test('2. Registro Exitoso - Flujo Completo', async () => {
        (userStorage.addUser as any).mockResolvedValue({ id: 'new-user' });

        renderComponent();
        await fillForm();

        const submitBtn = screen.getByRole('button', { name: /Crear Cuenta/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(userStorage.addUser).toHaveBeenCalled();
        });

        // Verificamos llamada a mockToastFn (la función directa)
        await waitFor(() => {
            expect(mockToastFn).toHaveBeenCalledWith(expect.objectContaining({
                title: expect.stringContaining('Registro Exitoso'),
            }));
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/');
        }, { timeout: 3000 });
    });

    test('3. Registro Fallido - Error al crear usuario', async () => {
        (userStorage.addUser as any).mockRejectedValue(new Error('Error de base de datos'));

        renderComponent();
        await fillForm();
        
        const submitBtn = screen.getByRole('button', { name: /Crear Cuenta/i });
        fireEvent.click(submitBtn);
        
        await waitFor(() => {
            expect(mockToastFn).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Error de Registro',
                variant: 'destructive'
            }));
        });
    });
});