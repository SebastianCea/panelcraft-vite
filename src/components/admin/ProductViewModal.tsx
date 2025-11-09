import { Product } from '../../types/product'; 
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface ProductViewModalProps {
 isOpen: boolean;
 onClose: () => void;
 product: Product | null; 
}

export const ProductViewModal = ({ isOpen, onClose, product }: ProductViewModalProps) => {
 if (!product) return null;
  
  // 1. CÁLCULO DE STOCK BAJO: Si el stock es menor o igual al minStock (o 5 por defecto)
 const isLowStock = product.stock <= (product.minStock || 5);

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   {/* Aumentamos el tamaño máximo para acomodar la imagen */}
   <DialogContent className="max-w-4xl bg-card border-border">
    <DialogHeader>
     <DialogTitle className="text-2xl text-accent">Detalles del Producto</DialogTitle>
    </DialogHeader>
    
    {/* 2. ESTRUCTURA DE DOS COLUMNAS (Imagen y Detalles) */}
    <div className="grid md:grid-cols-3 gap-8 py-4">
      
     {/* 💡 COLUMNA 1: IMAGEN */}
     <div className="md:col-span-1 flex justify-center items-start">
      {product.image ? (
       <img 
        src={product.image} 
        alt={`Imagen de ${product.name}`} 
        className="w-full max-h-72 object-contain rounded-lg border border-border"
       />
      ) : (
       <div className="w-full h-72 flex items-center justify-center bg-muted/50 rounded-lg text-muted-foreground border border-border">
        No hay imagen de catálogo
       </div>
      )}
     </div>

     {/* COLUMNA 2: DETALLES (ocupa 2/3 del espacio) */}
     <div className="md:col-span-2 grid gap-4"> 
      
      {/* Nombre y Categoría en la misma fila */}
      <div className="grid gap-2">
       <Label className="text-muted-foreground">Nombre</Label>
       <p className="text-2xl font-bold text-foreground">{product.name}</p>
      </div>

      <div className="grid gap-2">
       <Label className="text-muted-foreground">Categoría</Label>
       <span className="inline-flex w-fit items-center rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent capitalize">
        {product.category.replace('-', ' ')}
       </span>
      </div>

      {/* 3. PRECIO, STOCK ACTUAL Y STOCK MÍNIMO (tres columnas) */}
      <div className="grid grid-cols-3 gap-4 border-y border-border py-4 my-2">
       {/* Precio */}
       <div className="grid gap-1">
        <Label className="text-muted-foreground">Precio (CLP)</Label>
        <p className="text-xl font-bold">
         {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(product.price)}
        </p>
       </div>
       
       {/* Stock Disponible */}
       <div className="grid gap-1">
        <Label className="text-muted-foreground">Stock Actual</Label>
        <p className={`text-xl font-bold ${isLowStock ? 'text-red-500' : 'text-primary'}`}>
         {product.stock}
         {isLowStock && <span className="text-sm font-semibold ml-2">⚠️ Alerta</span>}
        </p>
       </div>
       
       {/* 💡 Stock Mínimo */}
       <div className="grid gap-1">
        <Label className="text-muted-foreground">Mínimo Alerta</Label>
        <p className="text-xl font-bold">{product.minStock || 5}</p>
       </div>
      </div>
      
      {/* Descripción */}
      <div className="grid gap-2">
       <Label className="text-muted-foreground">Descripción</Label>
       <p className="text-base whitespace-pre-line text-foreground/80">{product.description || 'Sin descripción detallada.'}</p>
      </div>

      {/* ID de Producto */}
      <div className="grid gap-1 border-t border-border pt-4 mt-2">
       <Label className="text-muted-foreground text-sm">ID de Producto</Label>
       <p className="text-xs text-muted-foreground truncate">{product.id}</p>
      </div>
     </div>
    </div>
   </DialogContent>
  </Dialog>
 );
};