import { Product, ProductFormData} from '@/types/product';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductForm } from './ProductForm';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSubmit: (data: ProductFormData) => void;
}

export const ProductFormModal = ({ isOpen, onClose, product, onSubmit }: ProductModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border flex flex-col max-h-[95vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl text-accent">
            {product? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
          <DialogDescription>
            {product
              ? 'Modifica los datos del producto existente'
              : 'Completa el formulario para crear un nuevo producto'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto px-6  mb-3">
        <ProductForm product={product} onSubmit={onSubmit} onCancel={onClose} />
       </div>
      </DialogContent>
    </Dialog>
  );
};

