import React from 'react';
import { Product } from '@/types/product';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Asume que usas un path alias
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react'; // Iconos 


// 2. Define la interfaz de Props para la tabla de productos
export interface ProductTableProps {
  products: Product[]; // Cambiamos 'users' por 'products'
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void; // Acepta el ID del producto
  onView: (product: Product) => void;
}



export const ProductTable = ({ products, onEdit, onDelete, onView }: ProductTableProps) => {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">No hay productos registrados</p>
      </div>

    );
  }
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary hover:bg-secondary">
            {/* 3. Ajustamos los encabezados a los campos de Producto */}
            <TableHead className="text-secondary-foreground font-bold">Código</TableHead>
            <TableHead className="text-secondary-foreground font-bold">Nombre</TableHead>
            <TableHead className="text-secondary-foreground font-bold">Categoría</TableHead>
            <TableHead className="text-secondary-foreground font-bold">Precio</TableHead>
            <TableHead className="text-secondary-foreground font-bold">Stock</TableHead>
            <TableHead className="text-secondary-foreground font-bold text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            // 1. Cálculo de Stock Bajo (Debe ser la primera línea dentro del map)
            const isLowStock = product.stock <= (product.minStock || 5); 

            return (
              <TableRow 
                key={product.id} 
                className={"hover:bg-muted/50"} 
              >
                {/* Id */}
                <TableCell className="font-medium">{product.id}</TableCell>

                {/* Nombre */}
                <TableCell className="font-medium">{product.name}</TableCell>
                
                {/* Categoría */}
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                    {product.category.toUpperCase().replace('-', ' ')}
                  </span>
                </TableCell>
                
                {/* Precio (Formato CLP) */}
                <TableCell>
                  {`$${product.price.toLocaleString('es-CL', { maximumFractionDigits: 0 })}`}
                </TableCell>
                
                {/* 💡 2. CELDA DE STOCK MODIFICADA (Con Alerta Visual) */}
                <TableCell 
                  className={`relative font-semibold text-center ${
                    isLowStock 
                      ? "bg-yellow-300/80 text-red-800"
                      : ""
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-lg">{product.stock}</span>
                    {isLowStock && (
                      <span className="text-xs font-bold whitespace-nowrap pt-0.5">
                        ⚠️ BAJO STOCK
                      </span>
                    )}
                  </div>
                </TableCell>
                
                {/* 💡 3. CELDA DE ACCIONES (LA CUAL SE HABÍA PERDIDO - AÑADIDA DE NUEVO) */}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(product)}
                      className="h-8 w-8 text-accent hover:text-accent hover:bg-accent/10"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(product)}
                      className="h-8 w-8 text-accent hover:text-accent hover:bg-accent/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(product.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
  

}