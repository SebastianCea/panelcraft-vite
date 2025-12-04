import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Order } from "@/types/order";

interface OrderTableProps {
  orders: Order[];
  onView: (order: Order) => void;
}

export function OrderTable({ orders, onView }: OrderTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Orden</TableHead>
            <TableHead>Cliente (RUT)</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado Pago</TableHead>
            <TableHead>Estado Pedido</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No hay órdenes registradas.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
                <TableCell>{order.rutCliente}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        order.statePago === 'Aprobado' ? 'bg-green-100 text-green-800' :
                        order.statePago === 'Rechazado' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                        {order.statePago}
                    </span>
                </TableCell>
                <TableCell>{order.statePedido}</TableCell>
                <TableCell className="text-right">{formatPrice(order.finalTotal)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(order)}
                    title="Ver Detalle"
                  >
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
}