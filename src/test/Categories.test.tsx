import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Categories from '@/pages/Categories';
import * as productStorage from '@/lib/productStorage';
import React from 'react';

// --- MOCKS DE DEPENDENCIAS ---
vi.mock('@/lib/service/authenticateUser', () => ({
    getCurrentUser: () => null,
    hasAdminAccess: () => false
}));

// 🟢 CORRECCIÓN IMPORTANTE AQUÍ
vi.mock('@/lib/cartStorage', () => ({
    // Ahora addToCart devuelve true para simular éxito
    addToCart: vi.fn().mockReturnValue(true), 
    getCartCount: () => 0,
    // Agregamos la nueva función que usa el ProductCard, retornando 0 para que no bloquee la compra
    getProductQuantityInCart: vi.fn().mockReturnValue(0) 
}));

vi.mock('sonner', () => ({
    toast: { success: vi.fn(), error: vi.fn() }
}));

describe('Vista Categorías - Cobertura Completa', () => {
    
    const mockProducts = [
        {
            id: 'p1',
            name: 'PS5',
            price: 500000,
            category: 'consolas',
            image: 'img1.jpg',
            stock: 5,
            minStock: 1,
            description: 'Consola de videojuegos',
            createdAt: '',
            updatedAt: ''
        },
        {
            id: 'p2',
            name: 'Teclado RGB',
            price: 30000,
            category: 'accesorios',
            image: 'img2.jpg',
            stock: 10,
            minStock: 1,
            description: 'Teclado mecánico',
            createdAt: '',
            updatedAt: ''
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        
        vi.spyOn(productStorage, 'getProducts').mockResolvedValue(mockProducts as any);

        vi.spyOn(productStorage, 'getProductsByCategory').mockImplementation(async (category) => {
            return mockProducts.filter(p => p.category.toLowerCase() === category.toLowerCase()) as any;
        });
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    test('1. Debe mostrar todos los productos correctamente', async () => {
        render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Categories />
            </BrowserRouter>
        );

        expect(await screen.findByText('PS5')).toBeDefined();
        expect(await screen.findByText('Teclado RGB')).toBeDefined();
        
        const allBtn = await screen.findByRole('button', { 
            name: (content) => /Todo/i.test(content) 
        });
        expect(allBtn).toBeDefined();
    });

    test('2. Debe filtrar productos al seleccionar una categoría', async () => {
        render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Categories />
            </BrowserRouter>
        );

        await screen.findByText('PS5');

        const consolasBtn = await screen.findByRole('button', { 
            name: (content) => /Consolas/i.test(content) 
        });
        fireEvent.click(consolasBtn);

        expect(await screen.findByText('PS5')).toBeDefined();
        
        await waitFor(() => {
            expect(screen.queryByText('Teclado RGB')).toBeNull();
        });
    });

    test('3. Debe restaurar la lista completa al volver a "Todo"', async () => {
        render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Categories />
            </BrowserRouter>
        );

        await screen.findByText('PS5');

        const accesoriosBtn = await screen.findByRole('button', { 
            name: (content) => /Accesorios/i.test(content) 
        });
        fireEvent.click(accesoriosBtn);
        
        await waitFor(() => {
            expect(screen.queryByText('PS5')).toBeNull();
        });

        const todosBtn = await screen.findByRole('button', { 
            name: (content) => /Todo/i.test(content) 
        });
        fireEvent.click(todosBtn);

        expect(await screen.findByText('PS5')).toBeDefined();
    });

    test('4. Debe mostrar mensaje de vacío si la categoría no tiene items', async () => {
        render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Categories />
            </BrowserRouter>
        );

        await screen.findByText('PS5');

        const ropaBtn = screen.queryByRole('button', { 
            name: (content) => /Ropa/i.test(content) 
        });
        
        if (ropaBtn) {
            fireEvent.click(ropaBtn);
            expect(await screen.findByText(/No se encontraron productos/i)).toBeDefined();
        }
    });

    test('5. Debe manejar el caso donde no hay productos en el sistema', async () => {
        vi.spyOn(productStorage, 'getProducts').mockResolvedValue([]);
        
        render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Categories />
            </BrowserRouter>
        );

        expect(await screen.findByText(/No se encontraron productos/i)).toBeDefined();
    });
});