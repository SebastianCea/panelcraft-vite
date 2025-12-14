import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as productStorage from '@/lib/productStorage';

// --- ESTRATEGIA DE MOCK CORREGIDA ---

// 1. Creamos un objeto fijo con las funciones espía.
// Este objeto será el que compartan tanto el test como el código real.
const mockCollectionMethods = {
  getFullList: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getOne: vi.fn(),
  getList: vi.fn(),
};

// 2. Mockeamos el módulo. Cuando productStorage llame a pb.collection(),
// Vitest le entregará SIEMPRE nuestro objeto 'mockCollectionMethods'.
vi.mock('@/lib/pocketbase', () => ({
  pb: {
    collection: vi.fn(() => mockCollectionMethods),
    autoCancellation: vi.fn(),
  },
}));

describe('ProductStorage Library', () => {
  const mockProduct = {
    id: 'p1',
    name: 'PS5',
    price: 500000,
    category: 'consolas',
    stock: 10,
    created: '2023-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. GET PRODUCTS
  describe('getProducts', () => {
    it('debe retornar lista de productos en caso de éxito', async () => {
      // Usamos mockCollectionMethods directamente
      mockCollectionMethods.getFullList.mockResolvedValue([mockProduct]);

      const result = await productStorage.getProducts();

      expect(mockCollectionMethods.getFullList).toHaveBeenCalledWith({ sort: '-created' });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('PS5');
    });

    it('debe manejar error y retornar array vacío (catch block)', async () => {
      mockCollectionMethods.getFullList.mockRejectedValue(new Error('DB Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await productStorage.getProducts();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  // 2. ADD PRODUCT
  describe('addProduct', () => {
    it('debe crear un producto correctamente', async () => {
      mockCollectionMethods.create.mockResolvedValue(mockProduct);

      const newProd = await productStorage.addProduct(mockProduct as any);

      expect(mockCollectionMethods.create).toHaveBeenCalledWith(mockProduct);
      expect(newProd).toEqual(mockProduct);
    });

    it('debe lanzar error si falla la creación', async () => {
      mockCollectionMethods.create.mockRejectedValue(new Error('Create Fail'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(productStorage.addProduct(mockProduct as any)).rejects.toThrow('Create Fail');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  // 3. UPDATE PRODUCT
  describe('updateProduct', () => {
    it('debe actualizar producto correctamente', async () => {
      mockCollectionMethods.update.mockResolvedValue({ ...mockProduct, name: 'PS5 Pro' });

      const result = await productStorage.updateProduct('p1', { name: 'PS5 Pro' });

      expect(mockCollectionMethods.update).toHaveBeenCalledWith('p1', { name: 'PS5 Pro' });
      expect(result.name).toBe('PS5 Pro');
    });

    it('debe lanzar error si falla la actualización', async () => {
      mockCollectionMethods.update.mockRejectedValue(new Error('Update Fail'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(productStorage.updateProduct('p1', {})).rejects.toThrow('Update Fail');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  // 4. DELETE PRODUCT
  describe('deleteProduct', () => {
    it('debe retornar true si elimina correctamente', async () => {
      mockCollectionMethods.delete.mockResolvedValue(true);

      const result = await productStorage.deleteProduct('p1');

      expect(mockCollectionMethods.delete).toHaveBeenCalledWith('p1');
      expect(result).toBe(true);
    });

    it('debe retornar false si ocurre un error', async () => {
      mockCollectionMethods.delete.mockRejectedValue(new Error('Delete Fail'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await productStorage.deleteProduct('p1');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  // 5. UPDATE STOCK
  describe('updateStock', () => {
    it('debe restar stock correctamente', async () => {
      // Configuramos el mock para que getOne devuelva un producto válido
      // Esto soluciona el error "Cannot read properties of undefined (reading 'stock')"
      mockCollectionMethods.getOne.mockResolvedValue(mockProduct);
      mockCollectionMethods.update.mockResolvedValue({});

      // Restamos 2
      await productStorage.updateStock('p1', 2);

      // Verifica que calculó 10 - 2 = 8
      expect(mockCollectionMethods.update).toHaveBeenCalledWith('p1', { stock: 8 });
    });

    it('no debe bajar de 0 el stock', async () => {
      mockCollectionMethods.getOne.mockResolvedValue({ ...mockProduct, stock: 1 });
      mockCollectionMethods.update.mockResolvedValue({});

      // Restamos 5 (más de lo que hay)
      await productStorage.updateStock('p1', 5);

      // Verifica que se queda en 0
      expect(mockCollectionMethods.update).toHaveBeenCalledWith('p1', { stock: 0 });
    });

    it('debe manejar errores silenciosamente (solo log)', async () => {
      mockCollectionMethods.getOne.mockRejectedValue(new Error('Stock Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(productStorage.updateStock('p1', 1)).resolves.not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  // 6. GET PRODUCT BY ID
  describe('getProductById', () => {
    it('debe retornar un producto si existe', async () => {
      mockCollectionMethods.getOne.mockResolvedValue(mockProduct);
      const result = await productStorage.getProductById('p1');
      expect(result).toEqual(mockProduct);
    });

    it('debe retornar null si falla o no existe', async () => {
      mockCollectionMethods.getOne.mockRejectedValue(new Error('Not found'));
      const result = await productStorage.getProductById('p1');
      expect(result).toBeNull();
    });
  });

  // 7. GET PRODUCTS BY CATEGORY
  describe('getProductsByCategory', () => {
    it('debe filtrar productos correctamente', async () => {
      mockCollectionMethods.getFullList.mockResolvedValue([mockProduct]);

      const result = await productStorage.getProductsByCategory('consolas');

      expect(mockCollectionMethods.getFullList).toHaveBeenCalledWith({
        filter: `category = "consolas"`
      });
      expect(result).toHaveLength(1);
    });

    it('debe retornar array vacío en caso de error', async () => {
      mockCollectionMethods.getFullList.mockRejectedValue(new Error('Filter Error'));
      const result = await productStorage.getProductsByCategory('consolas');
      expect(result).toEqual([]);
    });
  });

  // 8. GET FEATURED PRODUCTS
  describe('getFeaturedProducts', () => {
    it('debe retornar productos destacados (getList)', async () => {
      // getList devuelve un objeto paginado { items: [] }
      mockCollectionMethods.getList.mockResolvedValue({ items: [mockProduct, mockProduct] });

      const result = await productStorage.getFeaturedProducts();

      expect(mockCollectionMethods.getList).toHaveBeenCalledWith(1, 6, { sort: '-created' });
      expect(result).toHaveLength(2);
    });

    it('debe retornar array vacío en caso de error', async () => {
      mockCollectionMethods.getList.mockRejectedValue(new Error('Featured Error'));
      const result = await productStorage.getFeaturedProducts();
      expect(result).toEqual([]);
    });
  });
});