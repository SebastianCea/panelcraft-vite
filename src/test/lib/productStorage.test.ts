import { test, expect, describe, beforeEach } from 'vitest';
// 🚨 Ajusta las rutas de importación según sea necesario
import { getProducts, updateStock, addProduct, getProductsByCategory } from '../../lib/productStorage'; 
import { Product, ProductFormData } from '@/types/product'; 




const MOCK_PRODUCT_DATA = {
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




describe('productStorage - Prueba de Actualización de Stock', () => {

    // 💡 Paso de Aislamiento: Limpia el localStorage antes de cada prueba.
    beforeEach(() => {
        localStorage.clear();
        // 💡 CASTEO (as ProductFormData): Aquí le decimos a TypeScript: "Confía en mí, es el tipo de entrada correcto."
        addProduct(MOCK_PRODUCT_DATA as ProductFormData); 
    });

    test('debe restar correctamente la cantidad vendida del stock total', () => {
        // Arrange (Configuración inicial)
        const initialProducts = getProducts();
        const productId = initialProducts[0].id;
        const quantityToSell = 5;

        // Act (Acción: Simular una venta)
        updateStock(productId, quantityToSell);

        // Assert (Verificación)
        const updatedProducts = getProducts();
        const finalStock = updatedProducts[0].stock;
        
        const expectedStock = MOCK_PRODUCT_DATA.stock - quantityToSell; // 50 - 5 = 45

        //  Verificamos que la resta sea correcta
        expect(finalStock).toBe(expectedStock);
        
       
    });

    test('debe prevenir que el stock caiga a valores negativos', () => {
        // Arrange (Configuración inicial)
        const initialProducts = getProducts();
        const productId = initialProducts[0].id;
        const quantityToOversell = 100; // Intentamos vender más de 50

        // Act (Acción: Intentar vender en exceso)
        updateStock(productId, quantityToOversell);

        // Assert (Verificación)
        const updatedProducts = getProducts();
        const finalStock = updatedProducts[0].stock;
        
        // El stock final debe ser 0 (por la lógica implementada en updateStock)
        expect(finalStock).toBe(0); 
    });

    test('debe devolver solo los productos que coinciden con la categoría solicitada', () => {
        const targetCategory = 'accesorios';

        // Act: Llamar a la función que queremos probar
        const filteredProducts = getProductsByCategory(targetCategory);

        // Assert:
        // 1. Verificamos que la cantidad sea la esperada (solo Teclado Gamer Hyper-K)
        expect(filteredProducts.length).toBe(1);

        // 2. Verificamos que el producto devuelto tenga la categoría correcta
        expect(filteredProducts[0].category).toBe(targetCategory);

        // 3. Verificamos que el producto devuelto sea el correcto
        expect(filteredProducts[0].name).toBe('Teclado Gamer Hyper-K');
    });
});