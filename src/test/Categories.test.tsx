import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Categories from '@/pages/Categories';
import * as productStorage from '@/lib/productStorage';
import React from 'react';

// --- MOCKS DE DEPENDENCIAS ---
// Necesarios para que el componente se monte sin errores de contexto

// 1. Mock de autenticación (usado en el Header)
vi.mock('@/lib/service/authenticateUser', () => ({
    getCurrentUser: () => null,
    hasAdminAccess: () => false
}));

// 2. Mock del carrito (usado en ProductCard)
vi.mock('@/lib/cartStorage', () => ({
    addToCart: vi.fn(),
    getCartCount: () => 0
}));

// 3. Mock de Sonner (Toast)
vi.mock('sonner', () => ({
    toast: { success: vi.fn() }
}));

describe('Vista Categorías - Cobertura Completa', () => {
    
    // Datos de prueba controlados
    const mockProducts = [
        {
            id: 'p1',
            name: 'PS5',
            price: 500000,
            category: 'consolas', // Categoría existente
            image: 'img1.jpg',
            stock: 5,
            minStock: 1,
            createdAt: '',
            updatedAt: ''
        },
        {
            id: 'p2',
            name: 'Teclado RGB',
            price: 30000,
            category: 'accesorios', // Otra categoría
            image: 'img2.jpg',
            stock: 10,
            minStock: 1,
            createdAt: '',
            updatedAt: ''
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        // Interceptamos getProducts para que devuelva nuestros datos
        vi.spyOn(productStorage, 'getProducts').mockReturnValue(mockProducts as any);
    });

    afterEach(() => {
        cleanup();
    });

    // --- TEST 1: ESTADO INICIAL (TODOS) ---
    test('1. Debe mostrar todos los productos y contar correctamente (Plural)', () => {
        render(<BrowserRouter><Categories /></BrowserRouter>);

        expect(screen.getByText('Explorar Categorías')).toBeDefined();
        // Deben aparecer ambos productos
        expect(screen.getByText('PS5')).toBeDefined();
        expect(screen.getByText('Teclado RGB')).toBeDefined();
        
        // Verificamos la lógica de pluralización: "2 productos"
        expect(screen.getByText(/Mostrando 2 productos/i)).toBeDefined();
        
        // Verificamos que el botón "Todos" tenga estilo activo (default)
        const allBtn = screen.getByRole('button', { name: /Todos/i });
        expect(allBtn.className).toContain('bg-accent'); // Verifica clase de activo
    });

    // --- TEST 2: FILTRADO POR CATEGORÍA ---
    test('2. Debe filtrar productos al seleccionar una categoría (Singular)', () => {
        render(<BrowserRouter><Categories /></BrowserRouter>);

        // Click en "Consolas"
        const consolasBtn = screen.getByRole('button', { name: /Consolas/i });
        fireEvent.click(consolasBtn);

        // Verificamos filtrado
        expect(screen.getByText('PS5')).toBeDefined();
        expect(screen.queryByText('Teclado RGB')).toBeNull(); // No debe estar
        
        // Verificamos la lógica de pluralización: "1 producto" (sin s)
        // Buscamos el nodo exacto o verificamos el texto
        const counterText = screen.getByText(/Mostrando 1/i);
        expect(counterText.textContent).not.toContain('productos'); // Debe decir "producto"
    });

    // --- TEST 3: RETORNO A "TODOS" ---
    test('3. Debe restaurar la lista completa al volver a "Todos"', () => {
        render(<BrowserRouter><Categories /></BrowserRouter>);

        // 1. Filtramos primero
        fireEvent.click(screen.getByRole('button', { name: /Accesorios/i }));
        expect(screen.queryByText('PS5')).toBeNull();

        // 2. Volvemos a Todos
        fireEvent.click(screen.getByRole('button', { name: /Todos/i }));
        expect(screen.getByText('PS5')).toBeDefined();
    });

    // --- TEST 4: CATEGORÍA VACÍA ---
    test('4. Debe mostrar mensaje de vacío si la categoría no tiene items', () => {
        render(<BrowserRouter><Categories /></BrowserRouter>);

        // Seleccionamos una categoría que no está en el mock (ej: Ropa)
        fireEvent.click(screen.getByRole('button', { name: /Ropa/i }));

        expect(screen.getByText('No hay productos en esta categoría')).toBeDefined();
        // El grid de productos no debe existir
        expect(screen.queryByText('Mostrando')).toBeNull();
    });

    // --- TEST 5: SIN PRODUCTOS (CARGA INICIAL VACÍA) ---
    test('5. Debe manejar el caso donde no hay productos en el sistema', () => {
        // Sobrescribimos el mock para devolver array vacío
        vi.spyOn(productStorage, 'getProducts').mockReturnValue([]);
        
        render(<BrowserRouter><Categories /></BrowserRouter>);

        expect(screen.getByText('No hay productos en esta categoría')).toBeDefined();
    });
});
