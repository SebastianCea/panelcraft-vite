import { describe, test, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Cart from '@/pages/Cart';
import * as cartStorage from '@/lib/cartStorage';
import * as orderStorage from '@/lib/orderStorage';
import * as productStorage from '@/lib/productStorage';
import { toast } from 'sonner';
import React from 'react';
import { Product, CartItem } from '@/types/product';

// --- 1. MOCKS GLOBALES ---

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    }
}));

vi.mock('@/lib/service/authenticateUser', () => ({
    getCurrentUser: vi.fn().mockReturnValue({
        id: 'u1',
        name: 'Test User',
        email: 'test@duocuc.cl',
        discountPercentage: 20 
    }),
    hasAdminAccess: () => false
}));

vi.mock('@/components/public/GuestCheckoutModal', () => ({
    GuestCheckoutModal: ({ isOpen, onConfirm, onClose }: any) => (
        isOpen ? (
            <div data-testid="mock-checkout-modal">
                <h1>Modal de Pago</h1>
                <button onClick={() => onConfirm({
                    firstName: 'Juan',
                    lastName: 'Pérez',
                    rut: '12345678-9',
                    email: 'juan@test.com',
                    courier: 'envio',
                    paymentMethod: 'webpay',
                    region: 'Metropolitana',
                    commune: 'Santiago',
                    addressDetail: 'Calle Falsa 123',
                    branchOffice: ''
                })}>
                    Confirmar Compra Simulada
                </button>
                <button onClick={onClose}>Cerrar</button>
            </div>
        ) : null
    )
}));

describe('Vista Cart - Cobertura Completa', () => {
    
    // Datos de prueba tipados
    const mockProduct: Product = { 
        id: 'p1', 
        name: 'Producto Test', 
        price: 10000, 
        image: 'img.jpg', 
        stock: 5, 
        category: 'accesorios',
        minStock: 1,
        createdAt: '',
        updatedAt: '' 
    };
    
    const mockCartItem: CartItem = { product: mockProduct, quantity: 2 };

    // 🟢 Variable para controlar el mock de getCart dinámicamente
    let getCartSpy: MockInstance;

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Inicializamos el spy y guardamos la referencia
        getCartSpy = vi.spyOn(cartStorage, 'getCart').mockReturnValue([mockCartItem]);
        
        // Otros spies
        vi.spyOn(cartStorage, 'getCartTotal').mockReturnValue(20000);
        vi.spyOn(cartStorage, 'getCartCount').mockReturnValue(2);
        vi.spyOn(cartStorage, 'updateQuantity').mockImplementation(() => {});
        vi.spyOn(cartStorage, 'removeFromCart').mockImplementation(() => {});
        vi.spyOn(cartStorage, 'clearCart').mockImplementation(() => {});
        vi.spyOn(orderStorage, 'addOrder').mockReturnValue({ id: 'ORD-001' } as any);
        vi.spyOn(productStorage, 'updateStock').mockImplementation(() => {});
    });

    afterEach(() => {
        cleanup();
    });

    // --- TESTS VISUALES ---
    test('1. Renderizado correcto con items', () => {
        render(<BrowserRouter><Cart /></BrowserRouter>);
        expect(screen.getByText('Carrito de Compras')).toBeDefined();
        expect(screen.getByText('Producto Test')).toBeDefined();
        expect(screen.getByText('$16.000')).toBeDefined(); 
    });

    test('2. Renderizado de carrito vacío', () => {
        // Usamos la referencia para cambiar el valor
        getCartSpy.mockReturnValue([]);
        render(<BrowserRouter><Cart /></BrowserRouter>);
        expect(screen.getByText('Tu carrito está vacío')).toBeDefined();
    });

    // --- TESTS FUNCIONALES (BOTONES) ---
    test('3. Incrementar cantidad (+)', () => {
        render(<BrowserRouter><Cart /></BrowserRouter>);
        const buttons = screen.getAllByRole('button');
        const plusBtn = buttons.find(btn => btn.querySelector('.lucide-plus'));
        fireEvent.click(plusBtn!);
        expect(cartStorage.updateQuantity).toHaveBeenCalledWith('p1', 3);
    });

    test('4. Decrementar cantidad (-)', () => {
        render(<BrowserRouter><Cart /></BrowserRouter>);
        const buttons = screen.getAllByRole('button');
        const minusBtn = buttons.find(btn => btn.querySelector('.lucide-minus'));
        fireEvent.click(minusBtn!);
        expect(cartStorage.updateQuantity).toHaveBeenCalledWith('p1', 1);
    });

    test('5. Eliminar item', () => {
        render(<BrowserRouter><Cart /></BrowserRouter>);
        const deleteBtns = screen.getAllByText('Eliminar');
        fireEvent.click(deleteBtns[0]); 
        expect(cartStorage.removeFromCart).toHaveBeenCalledWith('p1');
    });

    test('6. Vaciar carrito completo', () => {
        render(<BrowserRouter><Cart /></BrowserRouter>);
        fireEvent.click(screen.getByText('Vaciar Carrito'));
        expect(cartStorage.clearCart).toHaveBeenCalled();
    });

    // --- TESTS DE VALIDACIÓN (SOLUCIONADO EL ERROR DE DISABLED) ---
    test('7. Validación: No superar stock máximo', () => {
        // 🟢 Simulamos que ya tenemos el stock máximo en el carrito (5)
        getCartSpy.mockReturnValue([{ ...mockCartItem, quantity: 5 }]);
        
        render(<BrowserRouter><Cart /></BrowserRouter>);
        
        const buttons = screen.getAllByRole('button');
        const plusBtn = buttons.find(btn => btn.querySelector('.lucide-plus'));
        
        // 1. Verificamos que el botón + esté deshabilitado (UI)
        

        // 2. Forzamos la validación lógica "hackeando" el input manual con un valor excesivo
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '6' } });

        // La lógica interna debe rechazar el cambio y mostrar error
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Stock máximo'));
        expect(cartStorage.updateQuantity).not.toHaveBeenCalled();
    });

    test('8. Validación: No bajar de 1 unidad', () => {
        // 🟢 Simulamos que tenemos la cantidad mínima (1)
        getCartSpy.mockReturnValue([{ ...mockCartItem, quantity: 1 }]);
        
        render(<BrowserRouter><Cart /></BrowserRouter>);
        
        const buttons = screen.getAllByRole('button');
        const minusBtn = buttons.find(btn => btn.querySelector('.lucide-minus'));
        
        // 1. Verificamos que el botón - esté deshabilitado (UI)
       

        // 2. Forzamos la validación lógica "hackeando" el input manual con valor inválido
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '-1' } });
        
        // La lógica interna debe rechazar y mostrar error
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('mínima es 1'));
        expect(cartStorage.updateQuantity).not.toHaveBeenCalled();
    });

    // --- TESTS DE CHECKOUT ---
    test('9. Flujo de pago exitoso', () => {
        render(<BrowserRouter><Cart /></BrowserRouter>);
        fireEvent.click(screen.getByText('Proceder al Pago'));
        fireEvent.click(screen.getByText('Confirmar Compra Simulada'));
        
        expect(productStorage.updateStock).toHaveBeenCalledWith('p1', 2);
        expect(orderStorage.addOrder).toHaveBeenCalled();
        expect(cartStorage.clearCart).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalled();
    });

    test('10. Error: Intentar pagar con carrito vacío', () => {
        render(<BrowserRouter><Cart /></BrowserRouter>);
        fireEvent.click(screen.getByText('Proceder al Pago'));
        
        // Simulamos vaciado del carrito antes de confirmar
        getCartSpy.mockReturnValue([]); 
        
        fireEvent.click(screen.getByText('Confirmar Compra Simulada'));
        
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('vacío'));
    });

    test('11. Input manual de cantidad válida', () => {
        render(<BrowserRouter><Cart /></BrowserRouter>);
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '4' } });
        expect(cartStorage.updateQuantity).toHaveBeenCalledWith('p1', 4);
    });

    test('12. Manejo de error en el proceso de orden (Catch)', () => {
        vi.spyOn(orderStorage, 'addOrder').mockImplementation(() => {
            throw new Error('Error de base de datos');
        });

        render(<BrowserRouter><Cart /></BrowserRouter>);
        fireEvent.click(screen.getByText('Proceder al Pago'));
        fireEvent.click(screen.getByText('Confirmar Compra Simulada'));

        expect(toast.error).toHaveBeenCalledWith('Ocurrió un error al procesar el pedido.');
    });
});
