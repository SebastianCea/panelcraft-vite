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
import { GuestCheckoutModal, GuestCheckoutFormData } from '@/components/public/GuestCheckoutModal'; 
import { Order, OrderItem } from '@/types/order'; 
import { addOrder } from '@/lib/orderStorage'; 
import { updateStock } from '@/lib/productStorage';
import { getCurrentUser } from '@/lib/service/authenticateUser';
import { User } from '@/types/user';

const Cart = () => {
 const [cartItems, setCartItems] = useState<CartItem[]>([]);
 const [isGuestModalOpen, setIsGuestModalOpen] = useState(false); 
 
 // 🟢 Estado para usuario
 const [currentUser, setCurrentUser] = useState<User | null>(null);

 useEffect(() => {
  loadCart();
  const user = getCurrentUser();
  setCurrentUser(user);

  // 🟢 Listener de sincronización para actualizar descuento
  const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
  };
  window.addEventListener('authChange', handleAuthChange);
  return () => window.removeEventListener('authChange', handleAuthChange);

 }, []);

 const loadCart = () => {
  setCartItems(getCart());
 };

 const handleUpdateQuantity = (productId: string, newQuantity: number, productName: string, maxStock: number) => {
  if (newQuantity < 1) {
   toast.error('La cantidad mínima es 1.');
   return;
  }
  if (newQuantity > maxStock) {
   toast.error(`Stock máximo alcanzado para ${productName}.`);
   return;
  }
  updateQuantity(productId, newQuantity);
  loadCart();
  toast.info(`Cantidad de ${productName} actualizada a ${newQuantity}`);
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

 // 🟢 Cálculo de totales con descuento
 const subTotal = getCartTotal(); 
 const userDiscountRate = currentUser?.discountPercentage || 0;
 const discountValue = Math.round(subTotal * (userDiscountRate / 100));
 const finalTotal = subTotal - discountValue;

 const handleConfirmCheckout = (data: GuestCheckoutFormData) => {
  const currentCartItems = getCart();
  
  if (currentCartItems.length === 0) {
   toast.error('El carrito está vacío, no se puede generar la orden.');
   return;
  }

    const orderItems: OrderItem[] = currentCartItems.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        subTotal: item.product.price * item.quantity, 
        discountPercentage: userDiscountRate / 100, // Guardamos el % aplicado
        total: Math.round((item.product.price * item.quantity) * (1 - (userDiscountRate/100))),
    }));
    
    const newOrder: Omit<Order, 'id'> = {
        rutCliente: data.rut, 
        date: new Date().toLocaleDateString('es-CL'),
        items: orderItems,
        total: subTotal, 
        Courier: data.courier as Order['Courier'], 
        paymentMethod: data.paymentMethod as Order['paymentMethod'],
        addressDetail: data.addressDetail, 
        region: data.region, 
        commune: data.commune, 
        branchOffice: data.branchOffice, 
        paymentId: 'PAY-' + Date.now().toString().slice(-6), 
        statePago: 'Pendiente', 
        Tracking: 'PENDIENTE', 
        statePedido: 'En preparación',
        
        globalSubtotal: subTotal, 
        globalDiscount: discountValue, // 🟢 Guardamos el descuento total
        finalTotal: finalTotal, // 🟢 Total final a pagar
    };
    
    try {
        currentCartItems.forEach(item => {
            updateStock(item.product.id, item.quantity);
        });

        const savedOrder = addOrder(newOrder); 
        toast.success(`🎉 ¡Pedido N° ${savedOrder.id} generado! Descuento aplicado.`);
        
        clearCart();
        loadCart();
        setIsGuestModalOpen(false);
        window.dispatchEvent(new Event('cartUpdated'));

    } catch (error) {
        console.error("Error al guardar la orden:", error);
        toast.error('Ocurrió un error al procesar el pedido.');
    }
 };

 const handleProceedToPayment = () => {
  setIsGuestModalOpen(true);
 };

 const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CL', {
   style: 'currency',
   currency: 'CLP',
   minimumFractionDigits: 0,
  }).format(price);
 };

 if (cartItems.length === 0) {
  return (
   <div className="min-h-screen bg-background">
    <PublicHeader />
    <div className="container mx-auto px-4 py-16">
     <Card className="max-w-md mx-auto border-border bg-card">
      <CardContent className="p-12 text-center">
       <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
       <h2 className="mb-2 text-2xl font-bold">Tu carrito está vacío</h2>
       <p className="text-muted-foreground mb-6">Agrega productos para comenzar tu compra</p>
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
      <p className="text-muted-foreground">{cartItems.length} producto{cartItems.length !== 1 ? 's' : ''} en tu carrito</p>
     </div>
     <Button variant="outline" onClick={handleClearCart} className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
      <Trash2 className="mr-2 h-4 w-4" /> Vaciar Carrito
     </Button>
    </div>

    <div className="grid gap-8 lg:grid-cols-3">
     <div className="lg:col-span-2 space-y-4">
      {cartItems.map((item) => (
       <Card key={item.product.id} className="border-border bg-card">
        <CardContent className="p-4">
         <div className="flex gap-4">
          <img src={item.product.image} alt={item.product.name} className="h-24 w-24 rounded-lg object-cover" />
          <div className="flex-1">
           <h3 className="mb-1 text-lg font-semibold">{item.product.name}</h3>
           <p className="text-xl font-bold text-accent">{formatPrice(item.product.price)}</p>
           <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-2">
             <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1, item.product.name, item.product.stock)} disabled={item.quantity <= 1}>
              <Minus className="h-4 w-4" />
             </Button>
             <Input type="number" min="1" value={item.quantity} onChange={(e) => handleUpdateQuantity(item.product.id, parseInt(e.target.value) || 1, item.product.name, item.product.stock)} className="w-16 text-center" />
             <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1, item.product.name, item.product.stock)} disabled={item.quantity >= item.product.stock}>
              <Plus className="h-4 w-4" />
             </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleRemove(item.product.id, item.product.name)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
             <Trash2 className="mr-2 h-4 w-4" /> Eliminar
            </Button>
           </div>
          </div>
          <div className="text-right">
           <p className="text-lg font-bold">{formatPrice(item.product.price * item.quantity)}</p>
          </div>
         </div>
        </CardContent>
       </Card>
      ))}
     </div>

     <div className="lg:col-span-1">
      <Card className="sticky top-20 border-border bg-card">
       <CardContent className="p-6">
        <h2 className="mb-4 text-2xl font-bold text-accent">Resumen del Pedido</h2>
        <div className="space-y-3 border-b border-border pb-4">
         {cartItems.map((item) => (
          <div key={item.product.id} className="flex justify-between text-sm">
           <span className="text-muted-foreground">{item.product.name} x{item.quantity}</span>
           <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
          </div>
         ))}
        </div>

        <div className="mt-4 space-y-2">
         <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatPrice(subTotal)}</span>
         </div>

         {/* 🟢 Descuento Duoc */}
         {userDiscountRate > 0 && (
             <div className="flex justify-between text-green-500">
              <span className="flex items-center gap-1">Desc. DuocUC ({userDiscountRate}%)</span>
              <span className="font-medium">- {formatPrice(discountValue)}</span>
             </div>
         )}

         <div className="flex justify-between">
          <span className="text-muted-foreground">Envío</span>
          <span className="font-medium text-accent">Gratis</span>
         </div>
        </div>

        <div className="mt-4 flex justify-between border-t border-border pt-4">
         <span className="text-xl font-bold">Total Final</span>
         <span className="text-2xl font-bold text-accent">{formatPrice(finalTotal)}</span>
        </div>

        <Button className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg" onClick={handleProceedToPayment}>
         Proceder al Pago
        </Button>

        <Button variant="outline" className="mt-3 w-full" asChild>
         <Link to="/categorias">Seguir Comprando</Link>
        </Button>
        
        <div className='text-center mt-4 text-sm'>
         <p className='text-muted-foreground'>¿Ya tienes cuenta? <Link to="/login" className="text-accent hover:underline ml-1">Inicia Sesión</Link></p>
        </div>
       </CardContent>
      </Card>
     </div>
    </div>
   </div>

   <footer className="mt-16 border-t border-border bg-card py-8">
    <div className="container mx-auto px-4 text-center">
     <p className="text-muted-foreground">© 2025 Level-Up⚡ Gamer. Todos los derechos reservados.</p>
    </div>
   </footer>
   
   <GuestCheckoutModal 
      isOpen={isGuestModalOpen} 
      onClose={() => setIsGuestModalOpen(false)} 
      onConfirm={handleConfirmCheckout}
      currentUser={currentUser} 
   />
  </div>
 );
};

export default Cart;