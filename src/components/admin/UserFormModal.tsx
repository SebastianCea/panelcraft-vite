import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, UserFormData } from "@/types/user";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  initialData?: User; // 🟢 Propiedad requerida
}

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: UserFormModalProps) {
  const form = useForm<UserFormData>({
    defaultValues: {
      name: "",
      rut: "",
      email: "",
      password: "",
      userType: "Cliente",
      birthdate: "",
      region: "",
      comuna: "",
      address: "",
      discountPercentage: 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        rut: initialData.rut,
        email: initialData.email,
        password: "", // No mostramos la contraseña
        userType: initialData.userType,
        birthdate: initialData.birthdate,
        region: initialData.region,
        comuna: initialData.comuna,
        address: initialData.address,
        discountPercentage: initialData.discountPercentage || 0,
      });
    } else {
      form.reset({
        name: "",
        rut: "",
        email: "",
        password: "",
        userType: "Cliente",
        birthdate: "",
        region: "",
        comuna: "",
        address: "",
        discountPercentage: 0,
      });
    }
  }, [initialData, form, isOpen]);

  const handleSubmit = (data: UserFormData) => {
    // Si estamos editando y la contraseña está vacía, la eliminamos para no sobrescribirla
    if (initialData && !data.password) {
        delete data.password;
    }
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Usuario" : "Nuevo Usuario"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="rut"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>RUT</FormLabel>
                    <FormControl>
                        <Input placeholder="12345678-9" {...field} disabled={!!initialData} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="userType"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Cliente">Cliente</SelectItem>
                        <SelectItem value="Vendedor">Vendedor</SelectItem>
                        <SelectItem value="Administrador">Administrador</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{initialData ? "Nueva Contraseña (Opcional)" : "Contraseña"}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Región</FormLabel>
                    <FormControl>
                        <Input placeholder="Metropolitana" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="comuna"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Comuna</FormLabel>
                    <FormControl>
                        <Input placeholder="Santiago" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}