import React from 'react';
import { Order } from '@/types/order'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; 
import { Button } from '@/components/ui/button';
import { Package, MapPin, DollarSign, CreditCard } from 'lucide-react'; 

export interface OrderDetailModalProps {
 isOpen: boolean;
 onClose: () => void;
 order: Order | null;
}

export const OrderDetailModal = ({ isOpen, onClose, order }: OrderDetailModalProps) => {
 if (!order) return null;

 // Helper para formatear CLP sin decimales
 const formatCLP = (amount: number) => 
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(amount);

// 💡 Lógica Condicional de Entrega
 const isRetiro = order.Courier === 'retiro en tienda';

 // Helper para el nombre legible del método de pago
  const getPaymentMethodLabel = (method: Order['paymentMethod']) => {
    switch(method) {
      case 'webpay': return 'Webpay (TDC/TDD)';
      case 'bancoestado': return 'BancoEstado';
      case 'transferencia': return 'Transferencia Bancaria';
      default: return 'No definido';
    }
  }

  const deliveryType = isRetiro ? 'Retiro en Tienda' : 'Envío a Domicilio';

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   {/* 💡 FIX: Hacemos el modal en sí scrollable si el contenido excede el alto */}
   <DialogContent className="w-full max-w-md md:max-w-3xl bg-card border-border text-foreground flex flex-col max-h-[95vh] p-0">
    <DialogHeader className="p-6 pb-4 border-b border-border/50">
     <DialogTitle className="text-3xl text-accent">Detalle De Compra</DialogTitle>
    </DialogHeader>

        {/* 💡 CONTENEDOR SCROLLABLE (Cuerpo del modal) */}
        <div className="flex-grow overflow-y-auto px-6 py-4 space-y-6">

            {/* Información Principal de la Orden */}
            <div className="space-y-1 text-sm border-b border-border pb-3">
         <p>
          <span className="font-semibold">Orden N°:</span> {order.id}
         </p>
         <p>
          <span className="font-semibold">RUT Cliente:</span> {order.rutCliente}
         </p>
         <p>
          <span className="font-semibold">Fecha:</span> {order.date}
         </p>
        </div>
            
            {/* BLOQUE: Detalle de Entrega y Pago (USO DE GRID RESPONSIVO) */}
            {/* Forzamos que las columnas se apilen en móvil con md:grid-cols-2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2 pb-3 border-b border-border">
                
                {/* Columna de Entrega */}
                <div className="space-y-2 bg-muted/20 p-3 rounded-md">
                    <h3 className="font-bold flex items-center text-yellow-400">
                        <Package className="h-4 w-4 mr-2" /> Información de Entrega
                    </h3>
                    <p>
                        <span className="font-semibold">Tipo:</span> {deliveryType}
                    </p>
                    
                    {isRetiro ? (
                        <p className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-purple-400" />
                            <span className="font-semibold">Sucursal:</span> {order.branchOffice || 'No especificado'}
                        </p>
                    ) : (
                        <div className="space-y-1">
                            <p>
                                <span className="font-semibold">Región:</span> {order.region || 'N/A'}
                            </p>
                            <p>
                                <span className="font-semibold">Comuna:</span> {order.commune || 'N/A'}
                            </p>
                            <p>
                                <span className="font-semibold">Detalle Dirección:</span> {order.addressDetail || 'N/A'}
                            </p>
                            <p>
                                <span className="font-semibold">N° Tracking:</span> {order.Tracking}
                            </p>
                        </div>
                    )}
                </div>

                {/* Columna de Pago */}
                <div className="space-y-2 bg-muted/20 p-3 rounded-md">
                    <h3 className="font-bold flex items-center text-yellow-400">
                        <CreditCard className="h-4 w-4 mr-2" /> Estado Financiero
                    </h3>
                    <p>
                        <span className="font-semibold">Método:</span> {getPaymentMethodLabel(order.paymentMethod)}
                    </p>
                    <p>
                        <span className="font-semibold">ID Transacción:</span> {order.paymentId}
                    </p>
                    <p>
                        <span className="font-semibold">Estado del Pago:</span> 
                        <span className={`ml-1 font-bold ${order.statePago === 'Aprobado' ? 'text-green-500' : 'text-yellow-500'}`}>
                            {order.statePago}
                        </span>
                    </p>
                </div>
            </div>

        {/* Tabla de Items (Detalle de la Compra) */}
        <h3 className="text-lg font-semibold mt-4">Productos Comprados</h3>
            
            {/* 💡 FIX: ENVOLVER LA TABLA EN SCROLL HORIZONTAL */}
            <div className="overflow-x-auto rounded-lg border border-border">
                <Table className="min-w-full"> {/* Forzamos un ancho mínimo para que el scroll funcione */}
          <TableHeader className="bg-secondary">
           <TableRow className="text-secondary-foreground hover:bg-secondary">
           <TableHead className="w-[40%]">Producto</TableHead> {/* 💡 Damos más espacio al Producto */}
           <TableHead>Cantidad</TableHead>
           <TableHead>SubTotal</TableHead>
           <TableHead>Descuento</TableHead>
           <TableHead>Total</TableHead>
           </TableRow>
         </TableHeader>
         <TableBody className="text-foreground">
          {order.items.map((item, index) => (
          <TableRow key={index} className="hover:bg-muted/50 border-border">
           <TableCell className="font-medium">{item.name}</TableCell>
           <TableCell>{item.quantity}</TableCell>
           <TableCell>{formatCLP(item.subTotal)}</TableCell>
           <TableCell className={item.discountPercentage > 0 ? 'text-red-500 font-semibold' : 'text-muted-foreground'}>
            {item.discountPercentage > 0 ? `-${(item.discountPercentage * 100).toFixed(0)}%` : '—'}
           </TableCell>
           <TableCell className="font-bold">{formatCLP(item.total)}</TableCell>
           </TableRow>
          ))}
         </TableBody>
        </Table>
            </div>


        {/* Totales Finales */}
        <div className="flex flex-col items-end pt-4 space-y-1 text-base">
                {/* Contenedor de totales alineado a la derecha */}
         <div className="flex justify-between w-full max-w-xs">
         <span>Subtotal</span>
         <span className="font-semibold">{formatCLP(order.globalSubtotal)}</span>
        </div>
        <div className="flex justify-between w-full max-w-xs text-red-500">
         <span>Descuento Global</span>
         <span className="font-semibold">- {formatCLP(order.globalDiscount)}</span>
        </div>
        <div className="flex justify-between w-full max-w-xs text-accent border-t border-border pt-2 text-xl font-bold">
         <span>Total Final</span>
         <span>{formatCLP(order.finalTotal)}</span>
        </div>
        </div>

        </div> {/* Cierre del div principal scrollable */}

    <div className="p-4 border-t border-border flex justify-end">
    <Button onClick={onClose} variant="outline">
     Volver
    </Button>
    </div>
  </DialogContent>
  </Dialog>
);
};