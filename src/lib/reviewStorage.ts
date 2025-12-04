import { pb } from './pocketbase';
import { Review } from '@/types/review';

const COLLECTION_NAME = 'reviews';

/**
 * Obtiene todas las reseñas de un producto específico.
 */
export const getReviewsByProduct = async (productId: string): Promise<Review[]> => {
  try {
    const records = await pb.collection(COLLECTION_NAME).getFullList<Review>({
      filter: `productId = "${productId}"`,
      sort: '-created', // Más recientes primero
    });
    return records;
  } catch (error) {
    console.error(`Error obteniendo reseñas para el producto ${productId}:`, error);
    return [];
  }
};

/**
 * Agrega una nueva reseña.
 */
export const addReview = async (reviewData: Omit<Review, 'id' | 'created' | 'updated' | 'collectionId' | 'collectionName'>): Promise<Review> => {
  try {
    const record = await pb.collection(COLLECTION_NAME).create<Review>(reviewData);
    return record;
  } catch (error) {
    console.error('Error creando reseña:', error);
    throw error;
  }
};

/**
 * Calcula el promedio de calificación de un producto.
 * (Lo ideal sería hacerlo en el backend, pero por ahora lo hacemos aquí)
 */
export const getProductAverageRating = async (productId: string): Promise<number> => {
    const reviews = await getReviewsByProduct(productId);
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return Number((sum / reviews.length).toFixed(1)); // Retorna con 1 decimal
};