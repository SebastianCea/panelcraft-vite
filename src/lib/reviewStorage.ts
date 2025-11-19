import { Review } from '@/types/review';

const REVIEW_KEY = 'levelup_reviews';

export const getReviews = (): Review[] => {
  try {
    const data = localStorage.getItem(REVIEW_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error al cargar reseñas:", error);
    return [];
  }
};

export const getReviewsByProduct = (productId: string): Review[] => {
  const reviews = getReviews();
  // Ordenar por fecha más reciente
  return reviews
    .filter(r => r.productId === productId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addReview = (review: Omit<Review, 'id' | 'date'>): Review => {
  const reviews = getReviews();
  const newReview: Review = {
    ...review,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  };
  
  localStorage.setItem(REVIEW_KEY, JSON.stringify([...reviews, newReview]));
  return newReview;
};

export const getProductAverageRating = (productId: string): number => {
    const reviews = getReviewsByProduct(productId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return sum / reviews.length;
};