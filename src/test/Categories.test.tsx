import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Categories from '@/pages/Categories';
import React from 'react';

// Mockeamos la obtención de productos
vi.mock('@/lib/productStorage', () => ({
    getProducts: () => [
        { id: 'p1', name: 'Consola Gamer', price: 500000, category: 'consolas', image: '', stock: 5 },
        { id: 'p2', name: 'Mouse Pro', price: 30000, category: 'accesorios', image: '', stock: 10 }
    ]
}));

describe('Vista Categorías', () => {
    test('Debe renderizar la lista de productos y los filtros', () => {
        render(
            <BrowserRouter>
                <Categories />
            </BrowserRouter>
        );

        expect(screen.getByText('Explorar Categorías')).toBeDefined();
        
        // Verificamos que los productos del mock aparezcan
        expect(screen.getByText('Consola Gamer')).toBeDefined();
        expect(screen.getByText('Mouse Pro')).toBeDefined();
        
        // Verificamos que los botones de filtro existan
        expect(screen.getByRole('button', { name: /Consolas/i })).toBeDefined();
    });
});