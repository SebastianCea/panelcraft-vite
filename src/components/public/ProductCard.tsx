import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ShoppingCart, Eye } from 'lucide-react';
import { addToCart } from '@/lib/cartStorage';
import { toast } from 'sonner';
import { Link } from 'react-router-dom'; 

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
          {/* Hacemos la imagen clickeable también */}
          <Link to={`/producto/${product.id}`}>
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-110 cursor-pointer"
            />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <h3 className="mb-2 text-lg font-semibold line-clamp-2 hover:text-accent transition-colors">
            <Link to={`/producto/${product.id}`}>{product.name}</Link>
        </h3>
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
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Agregar
        </Button>
        
        {/* 🟢 BOTÓN VER DETALLE */}
        <Link to={`/producto/${product.id}`}>
            <Button variant="outline" className="px-3 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                <Eye className="h-4 w-4" />
            </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};