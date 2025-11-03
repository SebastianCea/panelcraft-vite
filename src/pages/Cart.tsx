import { useState, useEffect } from 'react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getCart, updateQuantity, removeFromCart, clearCart, getCartTotal } from '@/lib/cartStorage';
import { CartItem } from '@/types/product';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    setCartItems(getCart());
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
    loadCart();
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleRemove = (productId: string, productName: string) => {
    removeFromCart(productId);
    loadCart();
    toast.success(`${productName} eliminado del carrito`);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleClearCart = () => {
    clearCart();
    loadCart();
    toast.success('Carrito vaciado');
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const total = getCartTotal();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto border-border bg-card">
            <CardContent className="p-12 text-center">
              <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="mb-2 text-2xl font-bold">Tu carrito está vacío</h2>
              <p className="text-muted-foreground mb-6">
                Agrega productos para comenzar tu compra
              </p>
              <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/categorias">Explorar Productos</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-accent">Carrito de Compras</h1>
            <p className="text-muted-foreground">
              {cartItems.length} producto{cartItems.length !== 1 ? 's' : ''} en tu carrito
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleClearCart}
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Vaciar Carrito
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.product.id} className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="mb-1 text-lg font-semibold">{item.product.name}</h3>
                      <p className="text-xl font-bold text-accent">
                        {formatPrice(item.product.price)}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleUpdateQuantity(item.product.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateQuantity(
                                item.product.id,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-16 text-center"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleUpdateQuantity(item.product.id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(item.product.id, item.product.name)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 border-border bg-card">
              <CardContent className="p-6">
                <h2 className="mb-4 text-2xl font-bold text-accent">Resumen del Pedido</h2>
                
                <div className="space-y-3 border-b border-border pb-4">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.product.name} x{item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="font-medium text-accent">Gratis</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-between border-t border-border pt-4">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-2xl font-bold text-accent">{formatPrice(total)}</span>
                </div>

                <Button
                  className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  size="lg"
                  onClick={() => toast.info('Función de pago próximamente')}
                >
                  Proceder al Pago
                </Button>

                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  asChild
                >
                  <Link to="/categorias">Seguir Comprando</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2025 Level-Up⚡ Gamer. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Cart;
