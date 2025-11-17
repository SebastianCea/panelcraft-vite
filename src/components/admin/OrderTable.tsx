import React from 'react';
import { Order } from '@/types/order'; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; 
import { Button } from '@/components/ui/button';
import { Eye, Clock, Truck, Store } from 'lucide-react'; // Añadimos íconos para estados

export interface OrderTableProps {
 orders: Order[];
 onViewDetails: (order: Order) => void;
}

export const OrderTable = ({ orders, onViewDetails }: OrderTableProps) => {
 if (orders.length === 0) {
  return (
   <div className="rounded-lg border border-border bg-card p-12 text-center">
    <p className="text-muted-foreground">No hay órdenes registradas.</p>
   </div>
  );
 }

 // Helper para formatear CLP sin decimales
 const formatCLP = (amount: number) => 
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(amount);

 // Helper para determinar el color de la fila basado en el estado de pago
 const getRowClassName = (order: Order) => {
  switch (order.statePago) {
   case 'Pendiente':
    return 'bg-yellow-500/10 hover:bg-yellow-500/20'; 
   case 'Rechazado':
    return 'bg-red-500/10 hover:bg-red-500/20';   
   case 'Aprobado':
   default:
    return 'hover:bg-muted/50';
  }
 };
    
  // Helper para determinar el estilo del estado del pedido
  const getPedidoStatusBadge = (state: Order['statePedido']) => {
    let classes = 'px-2 py-1 rounded text-xs font-semibold flex items-center gap-1';
    let icon = <Clock className="h-3 w-3" />;
    
    switch (state) {
        case 'En preparación':
            classes += ' bg-blue-500/20 text-blue-500';
            break;
        case 'Enviado':
        case 'En camino':
            classes += ' bg-indigo-500/20 text-indigo-500';
            icon = <Truck className="h-3 w-3" />;
            break;
        case 'Recibido':
            classes += ' bg-green-500/20 text-green-500';
            break;
        default:
            classes += ' bg-gray-500/20 text-gray-500';
    }
    
    return <span className={classes}>{icon} {state}</span>;
  };

 return (
  <div className="rounded-lg border border-border bg-card overflow-hidden">
   <Table>
    <TableHeader className="bg-secondary">
     <TableRow className="hover:bg-secondary">
      <TableHead className="font-bold">Id</TableHead>
      <TableHead className="font-bold">Rut Cliente</TableHead>
      <TableHead className="font-bold">Fecha</TableHead>
      <TableHead className="font-bold text-center">Entrega</TableHead> {/* 💡 NUEVA COLUMNA */}
      <TableHead className="font-bold text-center">Total</TableHead>
      <TableHead className="font-bold">Estado Pago</TableHead>
      <TableHead className="font-bold">Estado Pedido</TableHead>
      <TableHead className="font-bold text-right">Detalle</TableHead>
     </TableRow>
    </TableHeader>
    <TableBody>
     {orders.map((order) => (
      <TableRow key={order.id} className={getRowClassName(order)}>
       <TableCell className="font-medium">{order.id}</TableCell>
       <TableCell>{order.rutCliente}</TableCell>
       <TableCell>{order.date}</TableCell>
              
              {/* 💡 CELDA DE ENTREGA */}
              <TableCell className="text-center text-sm font-medium">
                {order.Courier === 'retiro en tienda' ? (
                    <span className="flex items-center justify-center gap-1 text-purple-400">
                        <Store className="h-4 w-4" /> Retiro
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-1 text-blue-400">
                        <Truck className="h-4 w-4" /> Envío
                    </span>
                )}
              </TableCell>

       <TableCell className="font-bold text-center">{formatCLP(order.total)}</TableCell>
       
       {/* Celda de Estado de Pago con color */}
       <TableCell>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
         order.statePago === 'Aprobado' ? 'bg-green-500/20 text-green-500' :
         order.statePago === 'Pendiente' ? 'bg-yellow-500/20 text-yellow-500' :
         'bg-red-500/20 text-red-500'
        }`}>
         {order.statePago}
        </span>
       </TableCell>
       
       {/* Celda de Estado del Pedido (Usando el nuevo helper) */}
       <TableCell>{getPedidoStatusBadge(order.statePedido)}</TableCell>
       
       {/* Botón de Detalle (Modal) */}
       <TableCell className="text-right">
        <Button 
         variant="ghost" 
         size="icon" 
         onClick={() => onViewDetails(order)} 
         className="h-8 w-8 text-accent hover:text-accent/80"
         title="Ver Detalle de Compra"
        >
         <Eye className="h-4 w-4" />
        </Button>
       </TableCell>
      </TableRow>
     ))}
    </TableBody>
   </Table>
  </div>
 );
};