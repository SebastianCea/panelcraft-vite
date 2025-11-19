import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '@/lib/productStorage';
import { Product } from '@/types/product';
import { PublicHeader } from '@/components/public/PublicHeader';
import { ProductReviews } from '@/components/public/ProductReviews';
import { Button } from '@/components/ui/button';
import { addToCart } from '@/lib/cartStorage';
import { toast } from 'sonner';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | undefined>(undefined);

  useEffect(() => {
    if (id) {
      const found = getProductById(id);
      setProduct(found);
    }
  }, [id]);

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
    addToCart({ product, quantity: 1 });
    toast.success(`${product.name} agregado al carrito`);
    window.dispatchEvent(new Event('cartUpdated'));
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
            <div className="bg-card rounded-xl overflow-hidden border border-border shadow-lg">
                <img 
                    src={product.image} 
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

                {/* Stock y Botón */}
                <div className="border-t border-border pt-6 space-y-4">
                     <p className="flex items-center gap-2">
                        <span className={product.stock > 0 ? "text-green-400" : "text-red-400"}>
                            ● {product.stock > 0 ? 'En Stock' : 'Agotado'}
                        </span>
                        <span className="text-muted-foreground text-sm">
                            ({product.stock} unidades disponibles)
                        </span>
                     </p>

                     <Button 
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6"
                     >
                        <ShoppingCart className="mr-2 h-6 w-6" />
                        Agregar al Carrito
                     </Button>
                </div>
            </div>
        </div>

        {/* 🟢 SECCIÓN DE RESEÑAS INTEGRADA */}
        <ProductReviews productId={product.id} />

      </div>
    </div>
  );
};

export default ProductDetail;