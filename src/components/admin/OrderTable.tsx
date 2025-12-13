import { Order } from '@/types/order';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// 🟢 Actualizamos la interfaz para aceptar onUpdateStatus
interface OrderTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onUpdateStatus?: (orderId: string, status: Order['statePedido']) => void;
}

export const OrderTable = ({ orders, onView, onUpdateStatus }: OrderTableProps) => {
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  };

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'Entregado': return 'bg-green-500/10 text-green-500 border-green-500/20';
          case 'Recibido': return 'bg-green-500/10 text-green-500 border-green-500/20';
          case 'En camino': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
          case 'Cancelado': return 'bg-red-500/10 text-red-500 border-red-500/20';
          default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Cliente (RUT)</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                No hay pedidos registrados.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                <TableCell>{order.rutCliente}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{formatPrice(order.finalTotal || order.total)}</TableCell>
                <TableCell>
                    {/* 🟢 Selector de Estado si existe la función, si no Badge simple */}
                    {onUpdateStatus ? (
                        <Select 
                            defaultValue={order.statePedido} 
                            onValueChange={(value) => onUpdateStatus(order.id, value as Order['statePedido'])}
                        >
                            <SelectTrigger className={`w-[140px] h-8 text-xs font-medium border ${getStatusColor(order.statePedido)}`}>
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="En preparación">En preparación</SelectItem>
                                <SelectItem value="En camino">En camino</SelectItem>
                                <SelectItem value="Entregado">Entregado</SelectItem>
                                <SelectItem value="Recibido">Recibido</SelectItem>
                                <SelectItem value="Cancelado">Cancelado</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <Badge variant="outline" className={getStatusColor(order.statePedido)}>
                            {order.statePedido}
                        </Badge>
                    )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onView(order)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};