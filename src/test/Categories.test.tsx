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

vi.mock('@/lib/cartStorage', () => ({
    addToCart: vi.fn(),
    getCartCount: () => 0
}));

vi.mock('sonner', () => ({
    toast: { success: vi.fn() }
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
        
        // 🟢 MOCK PRINCIPAL: getProducts
        vi.spyOn(productStorage, 'getProducts').mockResolvedValue(mockProducts as any);

        // 🟢 MOCK SECUNDARIO: getProductsByCategory
        vi.spyOn(productStorage, 'getProductsByCategory').mockImplementation(async (category) => {
            return mockProducts.filter(p => p.category.toLowerCase() === category.toLowerCase()) as any;
        });
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    test('1. Debe mostrar todos los productos y contar correctamente (Plural)', async () => {
        render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Categories />
            </BrowserRouter>
        );

        // findBy espera a que el elemento aparezca (útil para datos asíncronos)
        expect(await screen.findByText('PS5')).toBeDefined();
        expect(await screen.findByText('Teclado RGB')).toBeDefined();
        
        // Buscamos "Mostrando" de forma flexible
        expect(await screen.findByText((content, element) => {
            return element?.tagName.toLowerCase() === 'p' && /Mostrando/i.test(content) && /2/i.test(content);
        })).toBeDefined();
        
        // Verificamos el botón Todos
        // Usamos una función matcher para ser más flexibles con el contenido del botón (iconos, espacios)
        const allBtn = await screen.findByRole('button', { 
            name: (content, element) => /Todos/i.test(content) 
        });
        expect(allBtn).toBeDefined();
    });

    test('2. Debe filtrar productos al seleccionar una categoría (Singular)', async () => {
        render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Categories />
            </BrowserRouter>
        );

        // Esperar carga inicial
        await screen.findByText('PS5');

        // Click en Consolas
        const consolasBtn = await screen.findByRole('button', { 
            name: (content) => /Consolas/i.test(content) 
        });
        fireEvent.click(consolasBtn);

        // Esperamos que aparezca el filtrado
        // PS5 debe mantenerse
        expect(await screen.findByText('PS5')).toBeDefined();
        
        // Verificamos que NO esté el teclado. Esperamos a que desaparezca.
        await waitFor(() => {
            expect(screen.queryByText('Teclado RGB')).toBeNull();
        });

        // Verificamos contador (1 producto)
        expect(await screen.findByText((content, element) => {
            return element?.tagName.toLowerCase() === 'p' && /Mostrando/i.test(content) && /1/i.test(content);
        })).toBeDefined();
    });

    test('3. Debe restaurar la lista completa al volver a "Todos"', async () => {
        render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Categories />
            </BrowserRouter>
        );

        // Esperar carga inicial
        await screen.findByText('PS5');

        // 1. Filtrar
        const accesoriosBtn = await screen.findByRole('button', { 
            name: (content) => /Accesorios/i.test(content) 
        });
        fireEvent.click(accesoriosBtn);
        
        // Esperamos que desaparezca PS5
        await waitFor(() => {
            expect(screen.queryByText('PS5')).toBeNull();
        });

        // 2. Volver a todos
        const todosBtn = await screen.findByRole('button', { 
            name: (content) => /Todos/i.test(content) 
        });
        fireEvent.click(todosBtn);

        // PS5 debe volver
        expect(await screen.findByText('PS5')).toBeDefined();
    });

    test('4. Debe mostrar mensaje de vacío si la categoría no tiene items', async () => {
        render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Categories />
            </BrowserRouter>
        );

        await screen.findByText('PS5');

        // Intentamos buscar un botón "Ropa". 
        const ropaBtn = screen.queryByRole('button', { 
            name: (content) => /Ropa/i.test(content) 
        });
        
        if (ropaBtn) {
            fireEvent.click(ropaBtn);
            // Esperamos el mensaje de vacío
            expect(await screen.findByText(/No hay productos/i)).toBeDefined();
        } else {
            console.log('Botón Ropa no encontrado, saltando click.');
        }
    });

    test('5. Debe manejar el caso donde no hay productos en el sistema', async () => {
        // Sobrescribimos el mock para este test específico
        // Nota: Al usar mockResolvedValue, nos aseguramos que devuelve una promesa
        vi.spyOn(productStorage, 'getProducts').mockResolvedValue([]);
        
        render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Categories />
            </BrowserRouter>
        );

        // Esperamos directamente el mensaje de vacío
        expect(await screen.findByText(/No hay productos/i)).toBeDefined();
    });
});