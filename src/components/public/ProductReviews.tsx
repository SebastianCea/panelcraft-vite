import React, { useState, useEffect } from 'react';
import { Review } from '@/types/review';
import { getReviewsByProduct, addReview } from '@/lib/reviewStorage';
import { getCurrentUser } from '@/lib/service/authenticateUser';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  
  const user = getCurrentUser();

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = () => {
    setReviews(getReviewsByProduct(productId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast.error('Debes iniciar sesión para dejar una reseña');
        return;
    }
    if (rating === 0) {
        toast.error('Por favor selecciona una calificación');
        return;
    }
    if (comment.trim().length < 5) {
        toast.error('El comentario es muy corto');
        return;
    }

    addReview({
        productId,
        userId: user.id,
        userName: user.name,
        rating,
        comment
    });

    toast.success('¡Gracias por tu opinión!');
    setRating(0);
    setComment('');
    loadReviews();
  };

  return (
    <div className="space-y-8 mt-8 border-t border-border pt-8">
      <h3 className="text-2xl font-bold text-accent">Reseñas de Clientes</h3>

      {/* Formulario de Nueva Reseña */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Escribe tu opinión</h4>
        {user ? (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="focus:outline-none transition-transform hover:scale-110"
                        >
                            <Star 
                                className={`h-8 w-8 ${
                                    star <= (hoverRating || rating) 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-muted-foreground'
                                }`} 
                            />
                        </button>
                    ))}
                </div>

                <Textarea 
                    placeholder="¿Qué te pareció el producto?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="bg-input border-border"
                />
                
                <Button type="submit" className="bg-accent text-accent-foreground">
                    Publicar Reseña
                </Button>
            </form>
        ) : (
            <div className="text-center py-4 bg-muted/20 rounded">
                <p className="text-muted-foreground">
                    Debes <a href="/login" className="text-accent underline">iniciar sesión</a> para dejar una reseña.
                </p>
            </div>
        )}
      </div>

      {/* Lista de Reseñas */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aún no hay reseñas. ¡Sé el primero!</p>
        ) : (
            reviews.map((review) => (
                <div key={review.id} className="flex gap-4 border-b border-border pb-4">
                    <Avatar>
                        <AvatarFallback className="bg-accent text-accent-foreground">
                            {review.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold">{review.userName}</span>
                            <span className="text-xs text-muted-foreground">
                                {new Date(review.date).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex gap-0.5 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${
                                        i < review.rating 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-muted-foreground/30'
                                    }`} 
                                />
                            ))}
                        </div>
                        <p className="text-sm text-gray-300">{review.comment}</p>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};