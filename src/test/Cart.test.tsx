import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Cart from '@/pages/Cart';
import React from 'react';

// 1. Mockeamos la librería que lee el carrito
vi.mock('@/lib/cartStorage', () => ({
    getCart: () => [
        {
            product: { id: 'p1', name: 'Producto Test', price: 10000, image: '', stock: 10 },
            quantity: 2
        }
    ],
    getCartTotal: () => 20000,
    getCartCount: () => 2,
    // Funciones vacías necesarias para que no falle al renderizar
    updateQuantity: vi.fn(),
    removeFromCart: vi.fn(),
    clearCart: vi.fn()
}));

// 2. Mock del usuario (CORREGIDO: Se agrega hasAdminAccess)
vi.mock('@/lib/service/authenticateUser', () => ({
    getCurrentUser: () => null,
    hasAdminAccess: () => false // <--- ESTA LÍNEA SOLUCIONA EL ERROR
}));

// 3. Mock de los storages adicionales para evitar errores
vi.mock('@/lib/orderStorage', () => ({
    addOrder: vi.fn()
}));

vi.mock('@/lib/productStorage', () => ({
    updateStock: vi.fn()
}));

describe('Vista Carrito', () => {
    test('Debe mostrar los productos cuando el carrito tiene items', () => {
        render(
            <BrowserRouter>
                <Cart />
            </BrowserRouter>
        );

        expect(screen.getByText('Carrito de Compras')).toBeDefined();
        expect(screen.getByText('Producto Test')).toBeDefined();
        expect(screen.getByText('Resumen del Pedido')).toBeDefined();
        
        // Verifica que el botón de pago esté presente
        expect(screen.getByRole('button', { name: /Proceder al Pago/i })).toBeDefined();
    });
});