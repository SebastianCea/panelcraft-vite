import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// 1. Esquema de Validación Zod para el invitado
const guestCheckoutSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido').max(50),
  lastName: z.string().min(1, 'El apellido es requerido').max(50),
  email: z.string().min(1, 'El correo es requerido').email('Correo electrónico inválido'),
  address: z.string().min(1, 'La dirección es requerida').max(100),
});

export type GuestCheckoutFormData = z.infer<typeof guestCheckoutSchema>;

interface GuestCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: GuestCheckoutFormData) => void;
}

export const GuestCheckoutModal = ({ isOpen, onClose, onConfirm }: GuestCheckoutModalProps) => {
  const form = useForm<GuestCheckoutFormData>({
    resolver: zodResolver(guestCheckoutSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      address: '',
    },
  });

  const onSubmit = (data: GuestCheckoutFormData) => {
    onConfirm(data);
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl text-accent">Datos de Envío</DialogTitle>
          <DialogDescription>
            Por favor, ingresa tus datos para completar la compra como invitado.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre" className="bg-input border-border" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu apellido" className="bg-input border-border" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Correo Electrónico */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="correo@ejemplo.com" className="bg-input border-border" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dirección de Envío */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección (Calle, Ciudad)</FormLabel>
                  <FormControl>
                    <Input placeholder="Calle 123, Comuna, Ciudad" className="bg-input border-border" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-4"
              disabled={form.formState.isSubmitting}
            >
              Confirmar y Pagar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
