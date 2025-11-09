import React from 'react';
import { Order } from '@/types/order'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; 
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react'; 

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-3xl text-accent">Detalle De Compra</DialogTitle>
        </DialogHeader>

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

        {/* Tabla de Items (Detalle de la Compra) */}
        <h3 className="text-lg font-semibold mt-4">Productos Comprados</h3>
        <Table>
          <TableHeader className="bg-secondary">
            <TableRow className="text-secondary-foreground hover:bg-secondary">
              <TableHead>Producto</TableHead>
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

        {/* Totales Finales */}
        <div className="flex flex-col items-end pt-4 space-y-1 text-base">
          <div className="flex justify-between w-64">
            <span>Subtotal</span>
            <span className="font-semibold">{formatCLP(order.globalSubtotal)}</span>
          </div>
          <div className="flex justify-between w-64 text-red-500">
            <span>Descuento Global</span>
            <span className="font-semibold">- {formatCLP(order.globalDiscount)}</span>
          </div>
          <div className="flex justify-between w-64 text-accent border-t border-border pt-2 text-xl font-bold">
            <span>Total Final</span>
            <span>{formatCLP(order.finalTotal)}</span>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Volver
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};