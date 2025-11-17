import { User, UserFormData } from '@/types/user';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserForm } from './UserForm';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSubmit: (data: UserFormData) => void;
}

export const UserFormModal = ({ isOpen, onClose, user, onSubmit }: UserModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border flex flex-col max-h-[95vh] p-0">
        <DialogHeader className = "p-6 pb-4">
          <DialogTitle className="text-2xl text-accent">
            {user ? 'Editar Usuario' : 'Nuevo Usuario'}
          </DialogTitle>
          <DialogDescription>
            {user
              ? 'Modifica los datos del usuario existente'
              : 'Completa el formulario para crear un nuevo usuario'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto px-6 mb-3">
        <UserForm user={user} onSubmit={onSubmit} onCancel={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
