export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1 a 5
  comment: string;
  date: string;
}

export type ReviewFormData = Pick<Review, 'rating' | 'comment'>;