import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// 1. Cambiamos 'userName' a 'itemName' en la interfaz
interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string; // Nombre genérico para Usuario o Producto
}

export const DeleteConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  itemName, // Usamos la prop genérica
}: DeleteConfirmDialogProps) => {
  // Determinamos el tipo de ítem para el mensaje, asumiendo que el nombre es suficiente
  const itemType = itemName.toLowerCase().includes('usuario') ? 'el usuario' : 'el ítem';

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-accent">¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente {itemType}
            <span className="font-semibold text-foreground"> {itemName}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

