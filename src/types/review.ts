export interface Review {
  // Campos de sistema de PocketBase
  id: string;
  collectionId?: string;
  collectionName?: string;
  created?: string;
  updated?: string;

  // Relaciones y datos
  productId: string;
  userId: string;
  userName: string; // Guardamos el nombre para mostrarlo fácil
  rating: number;   // 1 a 5
  comment: string;
  date: string;     // Fecha de la reseña
}

export type ReviewFormData = Pick<Review, 'rating' | 'comment'>;