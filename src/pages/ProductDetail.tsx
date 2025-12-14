import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '@/lib/productStorage';
import { Product } from '@/types/product';
import { PublicHeader } from '@/components/public/PublicHeader';
import { ProductReviews } from '@/components/public/ProductReviews';
import { Button } from '@/components/ui/button';
// 🟢 Importamos la nueva función
import { addToCart, getProductQuantityInCart } from '@/lib/cartStorage';
import { toast } from 'sonner';
import { ShoppingCart, ArrowLeft, Loader2, Plus, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // ... (useEffect y estados de carga igual que antes) ...
  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        setIsLoading(true);
        const found = await getProductById(id);
        setProduct(found);
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <PublicHeader />
            <div className="container py-20 flex justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-accent" />
            </div>
        </div>
    );
  }

  if (!product) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <PublicHeader />
            <div className="container py-20 text-center">
                <h2 className="text-2xl">Producto no encontrado</h2>
                <Link to="/categorias" className="text-accent hover:underline mt-4 block">Volver al catálogo</Link>
            </div>
        </div>
    )
  }

  const handleAddToCart = () => {
    // 🟢 VALIDACIÓN DE STOCK + CARRITO
    const quantityInCart = getProductQuantityInCart(product.id);
    const availableStock = product.stock - quantityInCart;

    if (quantity > availableStock) {
        if (availableStock <= 0) {
            toast.error("¡Ya tienes todo el stock de este producto en tu carrito!");
        } else {
            toast.error(`No puedes agregar ${quantity}. Solo quedan ${availableStock} disponibles (considerando tu carrito).`);
        }
        return;
    }

    const success = addToCart({ product, quantity });
    
    if (success) {
        toast.success(`${quantity} x ${product.name} agregado al carrito`);
        window.dispatchEvent(new Event('cartUpdated'));
        setQuantity(1);
    } else {
        toast.error("Error al agregar: Stock insuficiente.");
    }
  };

  // ... (Resto del componente igual: handleIncrement, handleDecrement, return JSX) ...
  const handleIncrement = () => {
    if (quantity < product.stock) setQuantity(q => q + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-10">
      <PublicHeader />
      
      <div className="container mx-auto px-4 py-8">
        <Link to="/categorias" className="flex items-center text-muted-foreground hover:text-accent mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver a Categorías
        </Link>

        <div className="grid md:grid-cols-2 gap-10">
            {/* Imagen */}
            <div className="bg-card rounded-xl overflow-hidden border border-border shadow-lg aspect-square relative">
                <img 
                    src={product.image || '/placeholder.svg'} 
                    alt={product.name} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Info */}
            <div className="space-y-6">
                <div>
                    <h1 className="text-4xl font-bold text-accent mb-2">{product.name}</h1>
                    <span className="inline-block bg-secondary px-3 py-1 rounded-full text-sm uppercase tracking-wider font-semibold">
                        {product.category}
                    </span>
                </div>
                
                <p className="text-lg text-gray-300 leading-relaxed">
                    {product.description || 'Sin descripción disponible.'}
                </p>

                <div className="text-3xl font-bold text-white">
                    {formatPrice(product.price)}
                </div>

                {/* Stock y Botones */}
                <div className="border-t border-border pt-6 space-y-4">
                     <p className="flex items-center gap-2">
                        <span className={product.stock > 0 ? "text-green-400" : "text-red-400"}>
                            ● {product.stock > 0 ? 'En Stock' : 'Agotado'}
                        </span>
                        <span className="text-muted-foreground text-sm">
                            ({product.stock} unidades disponibles)
                        </span>
                     </p>

                     {product.stock > 0 && (
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-sm font-medium">Cantidad:</span>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={handleDecrement} disabled={quantity <= 1}>
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <Input 
                                    type="number" 
                                    value={quantity} 
                                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                                    className="w-16 text-center h-10"
                                />
                                <Button variant="outline" size="icon" onClick={handleIncrement} disabled={quantity >= product.stock}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                     )}

                     <Button 
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6 flex items-center justify-center gap-2"
                     >
                        {product.stock === 0 ? 'Agotado' : <ShoppingCart className="h-6 w-6" />}
                        {product.stock > 0 && <span>Agregar al Carrito</span>}
                     </Button>
                </div>
            </div>
        </div>

        <ProductReviews productId={product.id} />

      </div>
    </div>
  );
};

export default ProductDetail;