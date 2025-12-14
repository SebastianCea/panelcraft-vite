import { useState } from 'react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ShoppingCart, Eye, Plus, Minus } from 'lucide-react';
// 🟢 Importamos la nueva función auxiliar
import { addToCart, getProductQuantityInCart } from '@/lib/cartStorage';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    // 1. Obtener cuánto ya tenemos en el carrito
    const quantityInCart = getProductQuantityInCart(product.id);
    const availableStock = product.stock - quantityInCart;

    // 2. Validación
    if (quantity > availableStock) {
        if (availableStock <= 0) {
            toast.error("Ya tienes todo el stock disponible en tu carrito.");
        } else {
            toast.error(`Solo puedes agregar ${availableStock} unidad(es) más.`);
        }
        return;
    }
    
    // 3. Intentar agregar (ahora addToCart devuelve boolean, pero ya validamos arriba)
    const success = addToCart({ product, quantity });
    
    if (success) {
        toast.success(`${quantity} x ${product.name} agregado(s) al carrito`);
        window.dispatchEvent(new Event('cartUpdated'));
        setQuantity(1);
    } else {
        toast.error("No se pudo agregar al carrito por falta de stock.");
    }
  };

  // ... Resto del código (handleIncrement, handleDecrement, render, etc.) ...
  // Solo asegúrate de mantener el resto del componente igual
  
  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    } else {
        toast.warning("Has alcanzado el stock máximo disponible.");
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value);
      if (isNaN(val) || val < 1) {
          setQuantity(1);
      } else if (val > product.stock) {
          setQuantity(product.stock);
      } else {
          setQuantity(val);
      }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden border-border bg-card hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 group">
      {/* ... (Todo el JSX igual que antes) ... */}
      <CardHeader className="p-0">
        <div className="aspect-square overflow-hidden relative">
          <Link to={`/producto/${product.id}`}>
            <img
              src={product.image || '/placeholder.svg'}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
            />
          </Link>
          {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-bold text-lg bg-red-600 px-4 py-1 rounded-full transform -rotate-12">AGOTADO</span>
              </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 flex flex-col">
        <h3 className="mb-2 text-lg font-semibold line-clamp-2 hover:text-accent transition-colors">
            <Link to={`/producto/${product.id}`}>{product.name}</Link>
        </h3>
        
        <div className="mt-auto">
            <p className="text-2xl font-bold text-accent mb-1">{formatPrice(product.price)}</p>
            <p className={`text-xs ${product.stock > 0 ? 'text-green-500' : 'text-red-500'} font-medium mb-3`}>
            {product.stock > 0 ? `Stock: ${product.stock} unidades` : 'Sin stock'}
            </p>

            {product.stock > 0 && (
                <div className="flex items-center gap-2 mb-3">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={handleDecrement}
                        disabled={quantity <= 1}
                    >
                        <Minus className="h-3 w-3" />
                    </Button>
                    <Input 
                        type="number" 
                        value={quantity} 
                        onChange={handleQuantityChange}
                        className="h-8 w-14 text-center p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={handleIncrement}
                        disabled={quantity >= product.stock}
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
            )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 transition-transform active:scale-95"
          title="Agregar al Carrito"
        >
          {product.stock === 0 ? 'Agotado' : <ShoppingCart className="h-5 w-5" />}
        </Button>
        
        <Link to={`/producto/${product.id}`}>
            <Button variant="outline" className="px-3 border-accent text-accent hover:bg-accent hover:text-accent-foreground" title="Ver Detalle">
                <Eye className="h-5 w-5" />
            </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};