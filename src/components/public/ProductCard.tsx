import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { addToCart } from '@/lib/cartStorage';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const handleAddToCart = () => {
    addToCart({ product, quantity: 1 });
    toast.success(`${product.name} agregado al carrito`);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden border-border bg-card hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
      <CardHeader className="p-0">
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <h3 className="mb-2 text-lg font-semibold line-clamp-2">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {product.description}
          </p>
        )}
        <p className="text-2xl font-bold text-accent">{formatPrice(product.price)}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {product.stock > 0 ? `Stock: ${product.stock}` : 'Sin stock'}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Agregar al Carrito
        </Button>
      </CardFooter>
    </Card>
  );
};
