import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form"; // Importamos SubmitHandler
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
import { Textarea } from "@/components/ui/textarea";
import { Product, ProductFormData } from "@/types/product";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  initialData?: Product;
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ProductFormModalProps) {
  
  // 🟢 CORRECCIÓN 1: Definimos explícitamente el tipo del formulario
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      price: 0,
      category: "consolas", // 🟢 Usamos un valor válido por defecto en lugar de ""
      stock: 0,
      minStock: 0,
      description: "",
      image: "",
    },
  });

  // Cargar datos si estamos editando
  useEffect(() => {
    if (initialData) {
      // 🟢 CORRECCIÓN 2: Reseteamos asegurando que category es válido
      form.reset({
        name: initialData.name,
        price: initialData.price,
        category: initialData.category as ProductFormData['category'], // Forzamos el tipo si es necesario
        stock: initialData.stock,
        minStock: initialData.minStock,
        description: initialData.description,
        image: initialData.image,
      });
    } else {
      // Resetear a valores vacíos para nuevo producto
      form.reset({
        name: "",
        price: 0,
        category: "consolas", // Valor por defecto válido
        stock: 0,
        minStock: 0,
        description: "",
        image: "",
      });
    }
  }, [initialData, form, isOpen]);

  // 🟢 CORRECCIÓN 3: Tipado explícito del handler
  const handleSubmit: SubmitHandler<ProductFormData> = (data) => {
    onSubmit(data);
    onClose(); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Producto" : "Nuevo Producto"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del producto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      // 🟢 Manejo seguro del valor para el Select
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="consolas">Consolas</SelectItem>
                        <SelectItem value="computadores">Computación</SelectItem>
                        <SelectItem value="accesorios">Accesorios</SelectItem>
                        <SelectItem value="juegos-mesa">Juegos de Mesa</SelectItem>
                        <SelectItem value="ropa">Ropa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Mínimo (Alerta)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalles del producto..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Imagen</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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