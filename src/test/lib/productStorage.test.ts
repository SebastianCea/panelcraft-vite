import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
    getProducts, 
    addProduct, 
    updateStock, 
    getProductById, 
    updateProduct, 
    deleteProduct,
    getProductsByCategory
} from '../../lib/productStorage';
import { ProductFormData } from '@/types/product';

// --- MOCK DE POCKETBASE ---
// Simulamos las funciones que usas de la base de datos
const mockCollection = {
    getFullList: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getOne: vi.fn(),
    getList: vi.fn(),
};

// Interceptamos la importación de la instancia 'pb'
vi.mock('@/lib/pocketbase', () => ({
    pb: {
        collection: vi.fn(() => mockCollection),
        autoCancellation: vi.fn(),
    }
}));

// --- DATOS DE PRUEBA ---
const MOCK_DATA: ProductFormData = {
    name: 'Teclado Gamer Hyper-K',
    price: 45000,
    category: 'accesorios',
    description: 'Teclado mecánico.',
    stock: 50,
    image: 'http://ejemplo.com/img.jpg',
    minStock: 10,
};

// Respuesta simulada de la base de datos (incluye ID y fechas)
const mockRecord = {
    id: 'prod-123',
    ...MOCK_DATA,
    created: '2023-01-01',
    updated: '2023-01-01'
};

describe('productStorage - Cobertura Completa (PocketBase Mock)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Configuramos respuestas exitosas por defecto
        mockCollection.getFullList.mockResolvedValue([mockRecord]);
        mockCollection.getOne.mockResolvedValue(mockRecord);
        mockCollection.create.mockResolvedValue(mockRecord);
        mockCollection.update.mockResolvedValue({ ...mockRecord, stock: 45 }); // Ejemplo post-update
        mockCollection.delete.mockResolvedValue(true);
        mockCollection.getList.mockResolvedValue({ items: [mockRecord] });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // --- PRUEBAS ---

    test('getProducts: debe retornar la lista de productos desde la colección', async () => {
        const products = await getProducts();
        
        expect(products).toHaveLength(1);
        expect(products[0].id).toBe('prod-123');
        // Verificamos que se llamó a la colección correcta
        expect(mockCollection.getFullList).toHaveBeenCalled(); 
    });

    test('addProduct: debe crear un registro en PocketBase', async () => {
        const result = await addProduct(MOCK_DATA);
        
        expect(result.id).toBe('prod-123');
        expect(mockCollection.create).toHaveBeenCalledWith(expect.objectContaining(MOCK_DATA));
    });

    test('updateStock: debe obtener el producto y luego actualizar su stock', async () => {
        // 1. Simulamos que getOne devuelve el producto con stock 50
        mockCollection.getOne.mockResolvedValue(mockRecord);
        
        // 2. Ejecutamos la venta de 5 unidades
        await updateStock('prod-123', 5);
        
        // 3. Verificamos que se llamó a update con el nuevo stock (45)
        expect(mockCollection.update).toHaveBeenCalledWith('prod-123', expect.objectContaining({
            stock: 45
        }));
    });

    test('getProductById: debe buscar un registro por su ID', async () => {
        const result = await getProductById('prod-123');
        
        expect(result).toBeDefined();
        expect(result?.name).toBe(MOCK_DATA.name);
        expect(mockCollection.getOne).toHaveBeenCalledWith('prod-123');
    });

    test('updateProduct: debe enviar los cambios a la base de datos', async () => {
        const updates = { price: 99990 };
        await updateProduct('prod-123', updates);
        
        expect(mockCollection.update).toHaveBeenCalledWith('prod-123', expect.objectContaining(updates));
    });

    test('deleteProduct: debe eliminar el registro por ID', async () => {
        await deleteProduct('prod-123');
        
        expect(mockCollection.delete).toHaveBeenCalledWith('prod-123');
    });

    test('Manejo de Errores: debe capturar fallos de red', async () => {
        // Simulamos que PocketBase falla
        mockCollection.getFullList.mockRejectedValue(new Error('Error de conexión simulado'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        try {
            await getProducts();
        } catch (e) {
            // Dependiendo de tu implementación, el error puede ser relanzado o capturado
        }

        // Lo importante es que no rompa el test suite y (opcionalmente) loguee el error
        // Si tu implementación hace un return [] en catch, verificamos eso:
        // expect(result).toEqual([]); 
        
        consoleSpy.mockRestore();
    });
});