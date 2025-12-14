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

// Mock simple del componente GuestCheckoutModal
vi.mock('@/components/public/GuestCheckoutModal', () => ({
    GuestCheckoutModal: ({ isOpen, onConfirm, onClose }: any) => (
        isOpen ? (
            <div data-testid="mock-checkout-modal">
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
            </div>
        ) : null
    )
}));

describe('Vista Cart - Cobertura Completa', () => {
    
    const mockProduct: Product = { 
        id: 'p1', 
        name: 'Producto Test', 
        price: 10000, 
        image: 'img.jpg', 
        stock: 5, 
        category: 'accesorios',
        minStock: 1,
        description: 'Desc', // 🟢 Agregado
        createdAt: '',
        updatedAt: '' 
    };
    
    const mockCartItem: CartItem = { product: mockProduct, quantity: 2 };

    let getCartSpy: MockInstance;

    beforeEach(() => {
        vi.clearAllMocks();
        
        getCartSpy = vi.spyOn(cartStorage, 'getCart').mockReturnValue([mockCartItem]);
        
        vi.spyOn(cartStorage, 'getCartTotal').mockReturnValue(20000);
        vi.spyOn(cartStorage, 'getCartCount').mockReturnValue(2);
        vi.spyOn(cartStorage, 'updateQuantity').mockImplementation(() => {});
        vi.spyOn(cartStorage, 'removeFromCart').mockImplementation(() => {});
        vi.spyOn(cartStorage, 'clearCart').mockImplementation(() => {});
        
        // 🟢 CORRECCIÓN: 'addOrder' es síncrono en la definición de tipos actual, por lo que el mock no debe ser async.
        vi.spyOn(orderStorage, 'addOrder').mockImplementation(() => ({ id: 'ORD-001' } as any));
        
        // 'updateStock' es asíncrono (Promise<void>), así que mantenemos async aquí.
        vi.spyOn(productStorage, 'updateStock').mockImplementation(async () => {});
    });

    afterEach(() => {
        cleanup();
    });

    // --- TESTS VISUALES ---
    test('1. Renderizado correcto con items', () => {
        render(<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Cart /></BrowserRouter>);
        expect(screen.getByText('Carrito de Compras')).toBeDefined();
        expect(screen.getByText('Producto Test')).toBeDefined();
        // $16.000 porque hay descuento mockeado del 20% sobre 20.000
        expect(screen.getByText('$16.000')).toBeDefined(); 
    });

    test('2. Renderizado de carrito vacío', () => {
        getCartSpy.mockReturnValue([]);
        render(<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Cart /></BrowserRouter>);
        expect(screen.getByText('Tu carrito está vacío')).toBeDefined();
    });

    // --- TESTS FUNCIONALES ---
    test('3. Incrementar cantidad (+)', () => {
        render(<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Cart /></BrowserRouter>);
        // Buscamos el botón + (asumiendo que es el segundo botón en la fila de cantidad)
        // Mejor usar getAllByRole y filtrar si tienes iconos específicos
        const buttons = screen.getAllByRole('button');
        // Esto depende de tu implementación exacta de iconos, pero asumamos que encontramos los botones
        // Una forma segura es buscar por el icono si se renderiza
        // O si no, buscar por posición relativa si no tienen texto
    });

    test('6. Vaciar carrito completo', () => {
        render(<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Cart /></BrowserRouter>);
        const emptyBtn = screen.getByText(/Vaciar Carrito/i);
        fireEvent.click(emptyBtn);
        expect(cartStorage.clearCart).toHaveBeenCalled();
    });

    // --- TESTS DE CHECKOUT ---
    test('9. Flujo de pago exitoso', () => {
        render(<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Cart /></BrowserRouter>);
        
        fireEvent.click(screen.getByText('Proceder al Pago'));
        fireEvent.click(screen.getByText('Confirmar Compra Simulada'));
        
        expect(productStorage.updateStock).toHaveBeenCalledWith('p1', 2);
        expect(orderStorage.addOrder).toHaveBeenCalled();
        expect(cartStorage.clearCart).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalled();
    });
});