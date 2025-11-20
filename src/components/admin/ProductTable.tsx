import React from 'react';
import { Product } from '@/types/product'; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; 
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, AlertTriangle } from 'lucide-react'; 

export interface ProductTableProps {
 products: Product[];
 onEdit: (product: Product) => void;
 onDelete: (id: string) => void;
 onView: (product: Product) => void;
 isAdmin: boolean; // 🟢 Recibimos la propiedad
}

export const ProductTable = ({ products, onEdit, onDelete, onView, isAdmin }: ProductTableProps) => {
 if (products.length === 0) {
  return (
   <div className="rounded-lg border border-border bg-card p-12 text-center">
    <p className="text-muted-foreground">No hay productos registrados.</p>
   </div>
  );
 }

 const formatCLP = (amount: number) => 
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(amount);

  const getStockClassName = (stock: number, minStock: number) => {
    if (stock <= 0) return 'text-red-500 font-bold bg-red-500/10'; 
    if (stock <= minStock) return 'text-yellow-500 font-bold bg-yellow-500/10';
    return 'text-green-500/80'; 
  };

 return (
  <div className="rounded-lg border border-border bg-card overflow-hidden">
   <Table>
    <TableHeader className="bg-secondary">
     <TableRow className="hover:bg-secondary">
      <TableHead className="font-bold">Id</TableHead>
      <TableHead className="font-bold">Nombre</TableHead>
      <TableHead className="font-bold">Categoría</TableHead>
      <TableHead className="font-bold text-right">Precio</TableHead>
      <TableHead className="font-bold text-center">Stock</TableHead> 
      <TableHead className="font-bold text-center">Mín. Alerta</TableHead>
      <TableHead className="font-bold text-right">Acciones</TableHead>
     </TableRow>
    </TableHeader>
    <TableBody>
     {products.map((product) => {
            const stockClass = getStockClassName(product.stock, product.minStock);
            const isAlert = product.stock <= product.minStock;

            return (
      <TableRow key={product.id} className="hover:bg-muted/50">
       <TableCell className="font-medium text-xs text-muted-foreground">{product.id}</TableCell>
       <TableCell className="font-semibold">{product.name}</TableCell>
       <TableCell>{product.category}</TableCell>
       <TableCell className="text-right font-medium">{formatCLP(product.price)}</TableCell>
              
       <TableCell className={`text-center font-bold px-2 py-1 ${stockClass}`}>
                <span className="flex items-center justify-center gap-1">
                  {isAlert && <AlertTriangle className="h-3 w-3" />}
                  {product.stock}
                </span>
       </TableCell>
              
       <TableCell className="text-center text-sm text-muted-foreground">
                {product.minStock}
       </TableCell>

       <TableCell className="text-right space-x-1">
                {/* Botón Ver (Visible para todos) */}
                <Button variant="ghost" size="icon" onClick={() => onView(product)} className="h-8 w-8 text-blue-400 hover:bg-blue-400/20" title="Ver Detalle">
                    <Eye className="h-4 w-4" />
                </Button>
                
                {/* 🟢 LÓGICA ADMIN: Botón Editar */}
                {isAdmin && (
                    <Button variant="ghost" size="icon" onClick={() => onEdit(product)} className="h-8 w-8 text-yellow-500 hover:bg-yellow-500/20" title="Editar">
                        <Edit className="h-4 w-4" />
                    </Button>
                )}
                
                {/* 🟢 LÓGICA ADMIN: Botón Eliminar */}
                {isAdmin && (
                    <Button variant="ghost" size="icon" onClick={() => onDelete(product.id)} className="h-8 w-8 text-red-500 hover:bg-red-500/20" title="Eliminar">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
       </TableCell>
      </TableRow>
            );
          })}
    </TableBody>
   </Table>
  </div>
 );
};