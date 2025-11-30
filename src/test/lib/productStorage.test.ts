import { test, expect, describe, beforeEach, vi } from 'vitest';
import { 
    getProducts, 
    updateStock, 
    addProduct, 
    getProductsByCategory, 
    getProductById, 
    updateProduct, 
    deleteProduct, 
    getFeaturedProducts 
} from '../../lib/productStorage'; 
import { ProductFormData } from '@/types/product'; 

// interfaz ProductFormData
const MOCK_PRODUCT_DATA: ProductFormData = {
    name: 'Teclado Gamer Hyper-K',
    price: 45000,
    category: 'accesorios',
    description: 'Teclado mecánico con switches táctiles.',
    stock: 50,
    image: 'url/placeholder.jpg',
    minStock: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

describe('productStorage - Cobertura Completa', () => {

    // Limpiar localStorage antes de cada prueba
    beforeEach(() => {
        localStorage.clear();
        addProduct(MOCK_PRODUCT_DATA); 
    });

    // --- 1. PRUEBAS DE ACTUALIZACIÓN DE STOCK ---
    test('updateStock: debe restar correctamente la cantidad vendida', () => {
        const initialProducts = getProducts();
        const productId = initialProducts[0].id;
        updateStock(productId, 5);
        
        const updatedProducts = getProducts();
        expect(updatedProducts[0].stock).toBe(45);
    });

    test('updateStock: debe prevenir stock negativo (fijar en 0)', () => {
        const initialProducts = getProducts();
        const productId = initialProducts[0].id;
        
        // Espiamos console.error para que no ensucie la salida del test
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        updateStock(productId, 100); // Intentar vender más de lo que hay
        
        const updatedProducts = getProducts();
        expect(updatedProducts[0].stock).toBe(0);
        expect(consoleSpy).toHaveBeenCalled(); 
        consoleSpy.mockRestore();
    });

    test('updateStock: debe manejar productos no existentes sin crashear', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        // Intentamos actualizar un ID que no existe
        updateStock('id-inexistente', 5);
        
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    // --- 2. PRUEBAS DE BÚSQUEDA ---
    test('getProductById: debe encontrar un producto existente', () => {
        const products = getProducts();
        const targetId = products[0].id;
        
        const found = getProductById(targetId);
        expect(found).toBeDefined();
        expect(found?.name).toBe(MOCK_PRODUCT_DATA.name);
    });

    test('getProductById: debe retornar undefined si no existe', () => {
        const found = getProductById('id-falso-123');
        expect(found).toBeUndefined();
    });

    test('getProductsByCategory: debe filtrar correctamente', () => {
        // Agregamos un producto de otra categoría para probar el filtro
        const otherProduct: ProductFormData = { 
            ...MOCK_PRODUCT_DATA, 
            name: 'Polera', 
            category: 'ropa' 
        };
        addProduct(otherProduct);

        const accesorios = getProductsByCategory('accesorios');
        const ropa = getProductsByCategory('ropa');

        expect(accesorios.length).toBe(1);
        expect(accesorios[0].category).toBe('accesorios');
        expect(ropa.length).toBe(1);
        expect(ropa[0].category).toBe('ropa');
    });

    test('getFeaturedProducts: debe devolver los primeros productos (límite 6)', () => {
        // Llenamos con más productos para probar el slice
        for (let i = 0; i < 10; i++) {
            addProduct({ ...MOCK_PRODUCT_DATA, name: `Prod ${i}` });
        }
        
        const featured = getFeaturedProducts();
        expect(featured.length).toBeLessThanOrEqual(6);
    });

    // --- 3. PRUEBAS DE CRUD (UPDATE / DELETE) ---
    test('updateProduct: debe actualizar datos de un producto existente', () => {
        const products = getProducts();
        const idToUpdate = products[0].id;
        
        const newData: ProductFormData = {
            ...MOCK_PRODUCT_DATA,
            name: 'Teclado Actualizado v2',
            price: 99990
        };

        updateProduct(idToUpdate, newData);

        const updated = getProductById(idToUpdate);
        expect(updated?.name).toBe('Teclado Actualizado v2');
        expect(updated?.price).toBe(99990);
    });

    test('updateProduct: debe lanzar error si el producto no existe', () => {
        expect(() => {
            updateProduct('id-fantasma', MOCK_PRODUCT_DATA);
        }).toThrowError(/no encontrado/);
    });

    test('deleteProduct: debe eliminar un producto por ID', () => {
        const products = getProducts();
        const idToDelete = products[0].id;

        deleteProduct(idToDelete);

        const afterDelete = getProductById(idToDelete);
        expect(afterDelete).toBeUndefined();
        expect(getProducts().length).toBe(0);
    });
});
