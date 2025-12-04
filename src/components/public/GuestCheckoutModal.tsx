import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { User } from "@/types/user";

// Esquema de validación para el checkout
const checkoutSchema = z.object({
  firstName: z.string().min(2, "Nombre requerido"),
  lastName: z.string().min(2, "Apellido requerido"),
  rut: z.string().min(8, "RUT inválido"), // Validación básica
  email: z.string().email("Email inválido"),
  phone: z.string().min(8, "Teléfono requerido"),
  region: z.string().min(1, "Selecciona una región"),
  commune: z.string().min(1, "Selecciona una comuna"),
  addressDetail: z.string().optional(),
  courier: z.enum(["retiro en tienda", "envio"]),
  branchOffice: z.string().optional(), // Solo si es retiro
  paymentMethod: z.enum(["webpay", "bancoestado", "transferencia"]),
});

export type GuestCheckoutFormData = z.infer<typeof checkoutSchema>;

interface GuestCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: GuestCheckoutFormData) => void;
  initialData?: User | null; // 🟢 Propiedad para recibir datos del usuario logueado
}

const REGIONES = [
    { value: 'Región Metropolitana', label: 'Región Metropolitana' },
    { value: 'Región de Valparaíso', label: 'Región de Valparaíso' },
    { value: 'Región del Biobío', label: 'Región del Biobío' },
];

const COMUNAS: Record<string, string[]> = {
    'Región Metropolitana': ['Santiago', 'Providencia', 'Las Condes', 'Maipú'],
    'Región de Valparaíso': ['Valparaíso', 'Viña del Mar', 'Quilpué'],
    'Región del Biobío': ['Concepción', 'Talcahuano', 'San Pedro de la Paz'],
};

export function GuestCheckoutModal({ isOpen, onClose, onConfirm, initialData }: GuestCheckoutModalProps) {
  const form = useForm<GuestCheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      rut: "",
      email: "",
      phone: "",
      region: "",
      commune: "",
      addressDetail: "",
      courier: "envio",
      branchOffice: "",
      paymentMethod: "webpay",
    },
  });

  // 🟢 EFECTO: Cargar datos del usuario si existen cuando se abre el modal
  useEffect(() => {
    if (isOpen && initialData) {
        // Intentar separar nombre y apellido si vienen juntos
        const nameParts = initialData.name.split(' ');
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(' ') || "";

        form.reset({
            firstName: firstName,
            lastName: lastName,
            rut: initialData.rut,
            email: initialData.email,
            phone: "", // El teléfono no está en tu modelo User, se deja vacío
            region: initialData.region,
            commune: initialData.comuna, // Ojo con la diferencia de nombres (comuna vs commune)
            addressDetail: initialData.address,
            courier: "envio",
            branchOffice: "",
            paymentMethod: "webpay",
        });
    } else if (isOpen && !initialData) {
        // Resetear si es invitado real
        form.reset({
            firstName: "",
            lastName: "",
            rut: "",
            email: "",
            phone: "",
            region: "",
            commune: "",
            addressDetail: "",
            courier: "envio",
            branchOffice: "",
            paymentMethod: "webpay",
        });
    }
  }, [isOpen, initialData, form]);

  const courierType = form.watch("courier");
  const selectedRegion = form.watch("region");

  const handleSubmit = (data: GuestCheckoutFormData) => {
    onConfirm(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Finalizar Compra</DialogTitle>
          <DialogDescription>
            {initialData ? "Confirma tus datos para el envío." : "Ingresa tus datos para procesar el pedido."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            
            {/* Datos Personales */}
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
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
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="rut"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>RUT</FormLabel>
                    <FormControl><Input {...field} placeholder="12345678-9" /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl><Input {...field} placeholder="+569..." /></FormControl>
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
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl><Input {...field} type="email" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Datos de Envío */}
            <div className="space-y-4 border-t pt-4 mt-4">
                <h3 className="font-semibold">Información de Entrega</h3>
                
                <FormField
                    control={form.control}
                    name="courier"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tipo de Entrega</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="envio">Envío a Domicilio</SelectItem>
                                <SelectItem value="retiro en tienda">Retiro en Tienda</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                {courierType === 'envio' ? (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="region"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Región</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {REGIONES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="commune"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Comuna</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedRegion}>
                                        <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {selectedRegion && COMUNAS[selectedRegion]?.map(c => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="addressDetail"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Dirección (Calle, Número, Depto)</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                ) : (
                    <FormField
                        control={form.control}
                        name="branchOffice"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Sucursal de Retiro</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger><SelectValue placeholder="Selecciona sucursal" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Santiago Centro">Santiago Centro (Casa Matriz)</SelectItem>
                                    <SelectItem value="Providencia">Providencia</SelectItem>
                                    <SelectItem value="Viña del Mar">Viña del Mar</SelectItem>
                                    <SelectItem value="Concepción">Concepción</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
            </div>

            {/* Pago */}
            <div className="space-y-4 border-t pt-4 mt-4">
                <h3 className="font-semibold">Método de Pago</h3>
                <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                        <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona medio de pago" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="webpay">Webpay Plus (Crédito/Débito)</SelectItem>
                                <SelectItem value="bancoestado">BancoEstado / CuentaRUT</SelectItem>
                                <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="flex justify-end pt-4 space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Confirmar Pedido
                </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}