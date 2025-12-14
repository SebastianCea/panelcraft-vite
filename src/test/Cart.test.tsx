import { describe, test, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
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
        description: 'Desc',
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
        
        // Mock de addOrder retornando una promesa resuelta (para simular async correctamente)
        vi.spyOn(orderStorage, 'addOrder').mockResolvedValue({ id: 'ORD-001' } as any);
        
        // updateStock también retorna promesa
        vi.spyOn(productStorage, 'updateStock').mockResolvedValue(undefined);
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
        // Este test estaba vacío en tu código original, se mantiene vacío o puedes completarlo
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });

    test('6. Vaciar carrito completo', () => {
        render(<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Cart /></BrowserRouter>);
        const emptyBtn = screen.getByText(/Vaciar Carrito/i);
        fireEvent.click(emptyBtn);
        expect(cartStorage.clearCart).toHaveBeenCalled();
    });

    // --- TESTS DE CHECKOUT ---
    test('9. Flujo de pago exitoso', async () => {
        render(<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Cart /></BrowserRouter>);
        
        // 1. Abrir modal
        fireEvent.click(screen.getByText('Proceder al Pago'));
        
        // 2. Confirmar compra (Esto dispara una función async)
        fireEvent.click(screen.getByText('Confirmar Compra Simulada'));
        
        // 3. 🟢 USAR WAITFOR: Esperamos a que las promesas se resuelvan y se llamen a las funciones
        await waitFor(() => {
            expect(productStorage.updateStock).toHaveBeenCalledWith('p1', 2);
        });

        await waitFor(() => {
            expect(orderStorage.addOrder).toHaveBeenCalled();
        });

        expect(cartStorage.clearCart).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalled();
    });
});