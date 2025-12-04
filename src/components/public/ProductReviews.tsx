import React, { useState, useEffect } from 'react';
import { Review } from '@/types/review';
import { getReviewsByProduct, addReview } from '@/lib/reviewStorage';
import { getCurrentUser } from '@/lib/service/authenticateUser';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, Loader2 } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const user = getCurrentUser();

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    setIsLoading(true);
    const data = await getReviewsByProduct(productId);
    setReviews(data);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);

    try {
        await addReview({
            productId,
            userId: user.id,
            userName: user.name,
            rating,
            comment,
            date: new Date().toISOString()
        });

        toast.success('¡Gracias por tu opinión!');
        setRating(0);
        setComment('');
        loadReviews(); // Recargar la lista
    } catch (error) {
        toast.error('Error al publicar la reseña.');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 mt-12 border-t border-border pt-8">
      <h3 className="text-2xl font-bold text-accent flex items-center gap-2">
        <MessageSquare className="h-6 w-6" /> Reseñas de Clientes
      </h3>

      {/* Formulario */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h4 className="text-lg font-semibold mb-4">Escribe tu opinión</h4>
        {user ? (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">Calificación:</span>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="focus:outline-none transition-transform hover:scale-110 p-1"
                            >
                                <Star 
                                    className={`h-8 w-8 ${
                                        star <= (hoverRating || rating) 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-muted-foreground/30'
                                    }`} 
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <Textarea 
                    placeholder="¿Qué te pareció el producto? Comparte tu experiencia..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="bg-input border-border min-h-[100px]"
                />
                
                <Button 
                    type="submit" 
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                         <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publicando...
                        </>
                    ) : (
                        'Publicar Reseña'
                    )}
                </Button>
            </form>
        ) : (
            <div className="text-center py-6 bg-muted/10 rounded-lg border border-dashed border-border">
                <p className="text-muted-foreground">
                    Debes <a href="/login" className="text-accent underline font-medium">iniciar sesión</a> para dejar una reseña.
                </p>
            </div>
        )}
      </div>

      {/* Lista de Reseñas */}
      <div className="space-y-6">
        {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                Cargando reseñas...
            </div>
        ) : reviews.length === 0 ? (
            <div className="text-center py-8 bg-muted/5 rounded-lg">
                <p className="text-muted-foreground">Aún no hay reseñas para este producto.</p>
                <p className="text-sm text-accent mt-1">¡Sé el primero en opinar!</p>
            </div>
        ) : (
            <div className="grid gap-4">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-card/50 p-4 rounded-lg border border-border/50 flex gap-4 items-start">
                        <Avatar className="h-10 w-10 border border-accent/20">
                            <AvatarFallback className="bg-accent/10 text-accent font-bold">
                                {review.userName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-foreground">{review.userName}</span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(review.date).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        className={`h-3.5 w-3.5 ${
                                            i < review.rating 
                                            ? 'fill-yellow-400 text-yellow-400' 
                                            : 'text-muted-foreground/20'
                                        }`} 
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-gray-300 mt-2 leading-relaxed">{review.comment}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};