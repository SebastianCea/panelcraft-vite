import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ProductTable } from '@/components/admin/ProductTable';
import { Product } from '@/types/product';
import React from 'react';

// 🧹 IMPORTANTE: Limpiar el DOM después de cada prueba para evitar "fantasmas"
afterEach(() => {
    cleanup();
});

// 🛠️ MOCK SEGURO PARA ICONOS
vi.mock('lucide-react', () => ({
    Edit: () => <div data-testid="icon-edit" />,
    Trash2: () => <div data-testid="icon-trash" />,
    Eye: () => <div data-testid="icon-eye" />,
    AlertTriangle: () => <div data-testid="icon-alert" />,
}));

// --- DATOS DE PRUEBA ---
const mockProducts: Product[] = [
    {
        id: 'p1',
        name: 'Consola X',
        price: 500000,
        category: 'consolas',
        image: 'url1',
        stock: 20,
        minStock: 5,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
    },
    {
        id: 'p2',
        name: 'Mouse Gamer',
        price: 15000,
        category: 'accesorios',
        image: 'url2',
        stock: 2, // Stock bajo
        minStock: 5,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
    }
];

describe('Componente ProductTable', () => {

    // 1. PRUEBA DE SNAPSHOT
    test('Debe coincidir con el snapshot', () => {
        const { container } = render(
            <ProductTable 
                products={mockProducts} 
                onEdit={vi.fn()} 
                onDelete={vi.fn()} 
                onView={vi.fn()} 
                isAdmin={true} 
            />
        );
        expect(container).toMatchSnapshot();
    });

    // 2. PRUEBA: Estado Vacío
    test('Debe mostrar un mensaje cuando no hay productos', () => {
        render(
            <ProductTable 
                products={[]} 
                onEdit={vi.fn()} 
                onDelete={vi.fn()} 
                onView={vi.fn()} 
                isAdmin={false} 
            />
        );
        expect(screen.getByText(/No hay productos registrados/i)).toBeDefined();
    });

    // 3. PRUEBA: Renderizado de Datos
    test('Debe renderizar las filas correspondientes a los productos', () => {
        render(
            <ProductTable 
                products={mockProducts} 
                onEdit={vi.fn()} 
                onDelete={vi.fn()} 
                onView={vi.fn()} 
                isAdmin={false} 
            />
        );

        // Ahora getAllByText encontrará exactamente la cantidad correcta porque limpiamos el DOM
        expect(screen.getAllByText(/Consola X/i).length).toBe(1);
        expect(screen.getAllByText(/Mouse Gamer/i).length).toBe(1);
    });

    // 4. PRUEBA: Lógica Visual (Alerta de Stock)
    test('Debe mostrar alerta visual si el stock es bajo', () => {
        const { container } = render(
            <ProductTable 
                products={[mockProducts[1]]} // Solo el producto con stock bajo
                onEdit={vi.fn()} 
                onDelete={vi.fn()} 
                onView={vi.fn()} 
                isAdmin={false} 
            />
        );

        // Buscamos el número 2 exacto
        const stockElement = screen.getByText(/^2$/);
        expect(stockElement).toBeDefined();

        // Verificamos icono y color
        expect(screen.getByTestId('icon-alert')).toBeDefined();
        expect(container.querySelector('.text-yellow-500')).toBeDefined();
    });

    // 5. PRUEBA: Interacción
    test('El botón "Ver Detalle" debe ejecutar la función onView', () => {
        const onViewMock = vi.fn();
        render(
            <ProductTable 
                products={[mockProducts[0]]} 
                onEdit={vi.fn()} 
                onDelete={vi.fn()} 
                onView={onViewMock} 
                isAdmin={false} 
            />
        );

        const viewButton = screen.getByTitle(/Ver Detalle/i);
        fireEvent.click(viewButton);

        expect(onViewMock).toHaveBeenCalledTimes(1);
    });

    // 6. PRUEBA: Permisos de Admin
    test('Los botones de Editar y Eliminar solo aparecen si isAdmin es true', () => {
        // CASO 1: NO ADMIN
        const { queryAllByTestId, rerender } = render(
            <ProductTable 
                products={mockProducts} 
                onEdit={vi.fn()} 
                onDelete={vi.fn()} 
                onView={vi.fn()} 
                isAdmin={false} 
            />
        );
        
        // Como limpiamos el DOM, aquí no debería haber ningún botón "fantasma"
        expect(queryAllByTestId('icon-edit').length).toBe(0);
        expect(queryAllByTestId('icon-trash').length).toBe(0);

        // CASO 2: SÍ ADMIN
        rerender(
            <ProductTable 
                products={mockProducts} 
                onEdit={vi.fn()} 
                onDelete={vi.fn()} 
                onView={vi.fn()} 
                isAdmin={true} 
            />
        );
        
        // Ahora sí
        expect(queryAllByTestId('icon-edit').length).toBeGreaterThan(0);
        expect(queryAllByTestId('icon-trash').length).toBeGreaterThan(0);
    });

});