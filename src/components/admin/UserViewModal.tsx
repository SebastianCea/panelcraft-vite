import { User } from '@/types/user';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface UserViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const UserViewModal = ({ isOpen, onClose, user }: UserViewModalProps) => {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl text-accent">Detalles del Usuario</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label className="text-muted-foreground">RUT</Label>
            <p className="text-lg font-medium">{user.rut}</p>
          </div>

          <div className="grid gap-2">
            <Label className="text-muted-foreground">Nombre Completo</Label>
            <p className="text-lg font-medium">{user.name}</p>
          </div>

          <div className="grid gap-2">
            <Label className="text-muted-foreground">Email</Label>
            <p className="text-lg font-medium">{user.email}</p>
          </div>

          <div className="grid gap-2">
            <Label className="text-muted-foreground">Fecha de Nacimiento</Label>
            <p className="text-lg font-medium">
              {new Date(user.birthdate).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="grid gap-2">
            <Label className="text-muted-foreground">Tipo de Usuario</Label>
            <span className="inline-flex w-fit items-center rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
              {user.userType}
            </span>
          </div>

          <div className="grid gap-2">
            <Label className="text-muted-foreground">Dirección</Label>
            <p className="text-lg font-medium">{user.address}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="grid gap-2">
              <Label className="text-muted-foreground text-xs">Fecha de Creación</Label>
              <p className="text-sm">
                {new Date(user.createdAt).toLocaleString('es-ES')}
              </p>
            </div>
            <div className="grid gap-2">
              <Label className="text-muted-foreground text-xs">Última Actualización</Label>
              <p className="text-sm">
                {new Date(user.updatedAt).toLocaleString('es-ES')}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
