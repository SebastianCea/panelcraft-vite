import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onView: (user: User) => void;
}

export const UserTable = ({ users, onEdit, onDelete, onView }: UserTableProps) => {
  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">No hay usuarios registrados</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary hover:bg-secondary">
            <TableHead className="text-secondary-foreground font-bold">RUT</TableHead>
            <TableHead className="text-secondary-foreground font-bold">Nombre</TableHead>
            <TableHead className="text-secondary-foreground font-bold">Email</TableHead>
            <TableHead className="text-secondary-foreground font-bold">F. Nacimiento</TableHead>
            <TableHead className="text-secondary-foreground font-bold">Tipo</TableHead>
            <TableHead className="text-secondary-foreground font-bold">Dirección</TableHead>
            <TableHead className="text-secondary-foreground font-bold text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{user.rut}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{new Date(user.birthdate).toLocaleDateString()}</TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                  {user.userType}
                </span>
              </TableCell>
              <TableCell className="max-w-xs truncate">{user.address}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(user)}
                    className="h-8 w-8 text-accent hover:text-accent hover:bg-accent/10"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(user)}
                    className="h-8 w-8 text-accent hover:text-accent hover:bg-accent/10"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(user.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
