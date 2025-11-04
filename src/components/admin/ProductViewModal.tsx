import { Product } from '../../types/product'; // Importamos el tipo Producto
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl text-accent">Detalles del Producto</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
            
          {/* Nombre */}
          <div className="grid gap-2">
            <Label className="text-muted-foreground">Nombre</Label>
            <p className="text-lg font-medium">{product.name}</p>
          </div>

          {/* Precio y Stock en la misma fila */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-muted-foreground">Precio (CLP)</Label>
              <p className="text-lg font-medium">
                {/* Formateamos el precio a CLP */}
                {new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                }).format(product.price)}
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label className="text-muted-foreground">Stock Disponible</Label>
              <p className="text-lg font-medium">{product.stock} unidades</p>
            </div>
          </div>
          
          {/* Categoría */}
          <div className="grid gap-2">
            <Label className="text-muted-foreground">Categoría</Label>
            <span className="inline-flex w-fit items-center rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent capitalize">
              {product.category.replace('-', ' ')}
            </span>
          </div>

          {/* Descripción */}
          <div className="grid gap-2">
            <Label className="text-muted-foreground">Descripción</Label>
            <p className="text-lg whitespace-pre-line">{product.description || 'Sin descripción detallada.'}</p>
          </div>

          {/* Imagen (Se muestra la URL, no la imagen real por seguridad) */}
          <div className="grid gap-2 border-t border-border pt-4">
            <Label className="text-muted-foreground text-sm">ID de Producto</Label>
            <p className="text-xs text-muted-foreground truncate">{product.id}</p>
          </div>
          
          {/* Si tu Product tiene createdAt/updatedAt, puedes agregarlos aquí de forma similar a los usuarios */}

        </div>
      </DialogContent>
    </Dialog>
  );
};