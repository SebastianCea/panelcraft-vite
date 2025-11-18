import React from 'react';
import { Product } from '@/types/product';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Package, Hash, Zap, AlertTriangle } from 'lucide-react';

export interface ProductViewModalProps {
 isOpen: boolean;
 onClose: () => void;
 product: Product | null;
}

// Componente para una fila de detalle
const DetailRow: React.FC<{ label: string; value: string | number | React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between border-b border-border/50 py-2">
        <span className="font-semibold text-muted-foreground">{label}</span>
        <span className="text-foreground text-right max-w-[60%]">{value}</span>
    </div>
);

export const ProductViewModal = ({ isOpen, onClose, product }: ProductViewModalProps) => {
 if (!product) return null;

  const formatCLP = (amount: number) => 
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(amount);

  const isLowStock = product.stock <= product.minStock;

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   {/* Modal Responsivo */}
   <DialogContent className="w-full max-w-md md:max-w-lg bg-card border-border flex flex-col max-h-[95vh] p-0">
    <DialogHeader className="p-6 pb-4 border-b border-border/50">
     <DialogTitle className="text-3xl font-bold text-accent">
                {product.name}
            </DialogTitle>
     <DialogDescription>
                Detalles completos del producto en inventario.
            </DialogDescription>
    </DialogHeader>
        
        {/* Cuerpo con Scroll */}
        <div className="flex-grow overflow-y-auto px-6 py-4 space-y-6">
            
            {/* Imagen de Producto */}
            <div className="flex justify-center mb-4">
                <img 
                    src={product.image || 'https://placehold.co/150x150/1f004d/FFFFFF?text=Sin+Imagen'} 
                    alt={product.name} 
                    className="w-32 h-32 object-cover rounded-lg border-2 border-accent/50 shadow-md" 
                />
            </div>
            
            {/* 1. SECCIÓN PRINCIPAL */}
            <div className="space-y-3 p-4 bg-muted/10 rounded-lg">
                <h4 className="text-lg font-bold flex items-center text-yellow-400 border-b border-border pb-2 mb-3">
                    <Package className="h-5 w-5 mr-2" /> Información General
                </h4>
                <DetailRow label="Código Único (ID)" value={product.id} />
                <DetailRow label="Categoría" value={product.category} />
                <DetailRow label="Precio Unitario" value={formatCLP(product.price)} />
            </div>

            {/* 2. SECCIÓN DE INVENTARIO */}
            <div className="space-y-3 p-4 bg-muted/10 rounded-lg">
                <h4 className="text-lg font-bold flex items-center text-yellow-400 border-b border-border pb-2 mb-3">
                    <Hash className="h-5 w-5 mr-2" /> Gestión de Stock
                </h4>
                <DetailRow label="Stock Actual" value={
                    <span className={`font-bold ${isLowStock ? 'text-red-500' : 'text-green-500'}`}>
                        {product.stock} {isLowStock && <AlertTriangle className="h-4 w-4 inline ml-1 align-sub" />}
                    </span>
                } />
                <DetailRow label="Stock Mínimo de Alerta" value={product.minStock} />
                <DetailRow label="Fecha de Última Actualización" value={new Date(product.updatedAt).toLocaleDateString()} />
            </div>

            {/* 3. DESCRIPCIÓN */}
            <div className="space-y-2 p-4 bg-muted/10 rounded-lg">
                <h4 className="text-lg font-bold flex items-center text-yellow-400 border-b border-border pb-2 mb-3">
                    <Zap className="h-5 w-5 mr-2" /> Descripción
                </h4>
                <p className="text-gray-400 whitespace-pre-wrap">{product.description || 'N/A'}</p>
            </div>
            
        </div>
        
        {/* Footer fijo con botón de cierre */}
        <div className="p-4 border-t border-border flex justify-end">
            <Button onClick={onClose} variant="outline" className="text-foreground hover:bg-muted">
                Cerrar
            </Button>
        </div>

   </DialogContent>
  </Dialog>
 );
};