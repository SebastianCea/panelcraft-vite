import { useEffect } from 'react';
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

// 💡 Importamos el Select para el Courier y el Pago
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/ui/select';
import { User } from '@/types/user';

// Definición de Couriers (Actualizado)
const COURIERS = [
 { value: 'retiro en tienda', label: 'Retiro en tienda' },
 { value: 'envio', label: 'Envío a domicilio' }, 
];

// Definición de Sucursales
const SUCURSALES = [
 {value: 'Santiago (Av. Central 123)', label: 'Santiago (Av. Central 123)'}, 
 {value: 'Concepcion (Calle Sur 456)', label: 'Concepción (Calle Sur 456)'}, 
 {value: 'Valdivia (Río Calle-Calle 789)', label: 'Valdivia (Río Calle-Calle 789)'}
];

// Definición de Métodos de Pago
const PAYMENT_METHODS = [
    { value: 'webpay', label: 'Webpay (Tarjeta de Crédito/Débito)' },
    { value: 'bancoestado', label: 'BancoEstado' },
    { value: 'transferencia', label: 'Transferencia Bancaria' },
];

// 🟢 NUEVO: Constantes de Regiones y Comunas (Simuladas)
const REGIONES = [
    { value: 'metropolitana', label: 'Región Metropolitana' },
    { value: 'biobio', label: 'Región del Biobío' },
    { value: 'losrios', label: 'Región de Los Ríos' },
];

const COMUNAS_POR_REGION: Record<string, { value: string; label: string }[]> = {
    metropolitana: [
        { value: 'santiago', label: 'Santiago' },
        { value: 'providencia', label: 'Providencia' },
        { value: 'lascondes', label: 'Las Condes' },
    ],
    biobio: [
        { value: 'concepcion', label: 'Concepción' },
        { value: 'talcahuano', label: 'Talcahuano' },
    ],
    losrios: [
        { value: 'valdivia', label: 'Valdivia' },
        { value: 'launion', label: 'La Unión' },
    ],
};


// 1. Esquema de Validación Zod (ACTUALIZADO con Region y Comuna)
const guestCheckoutSchema = z.object({
 firstName: z.string().min(1, 'El nombre es requerido').max(50),
 lastName: z.string().min(1, 'El apellido es requerido').max(50),
 email: z.string().min(1, 'El correo es requerido').email('Correo electrónico inválido'),
 // CAMPO DETALLE DIRECCIÓN (Calle y número)
 addressDetail: z.string().max(100).optional(),
 // NUEVOS CAMPOS DE UBICACIÓN
 region: z.string().optional(),
 commune: z.string().optional(),
 // Sucursal
 branchOffice: z.string().optional(),
 // RUT
 rut: z.string().min(9, 'El RUT es requerido (Mínimo 9 caracteres)').max(12, 'RUT muy largo'),
 // Courier (Acepta solo 'retiro en tienda' o 'envio')
 courier: z.enum(['retiro en tienda', 'envio'], {
    required_error: "Debes seleccionar un método de entrega.",
  }),
  // Método de Pago
  paymentMethod: z.enum(['webpay', 'bancoestado', 'transferencia'], {
    required_error: "Debes seleccionar un método de pago.",
  }),
}).superRefine((data, ctx) => {
    // 🟢 LÓGICA CONDICIONAL: Si selecciona 'envio', se requieren dirección completa.
    if (data.courier === 'envio') {
        if (!data.region || data.region.trim().length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La Región es obligatoria para envíos.', path: ['region'] });
        }
        if (!data.commune || data.commune.trim().length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La Comuna es obligatoria para envíos.', path: ['commune'] });
        }
        if (!data.addressDetail || data.addressDetail.trim().length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El detalle de la dirección (calle/número) es obligatorio.', path: ['addressDetail'] });
        }
    }

    // 🟢 LÓGICA CONDICIONAL: Si selecciona 'retiro en tienda', branchOffice es requerido.
    if (data.courier === 'retiro en tienda' && (!data.branchOffice || data.branchOffice.trim().length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Debes seleccionar una sucursal para el retiro en tienda.',
            path: ['branchOffice'],
        });
    }
});

export type GuestCheckoutFormData = z.infer<typeof guestCheckoutSchema>;

interface GuestCheckoutModalProps {
 isOpen: boolean;
 onClose: () => void;
 onConfirm: (data: GuestCheckoutFormData) => void;
 currentUser?: User | null; // 🟢 NUEVA PROP OPCIONAL
}

export const GuestCheckoutModal = ({ isOpen, onClose, onConfirm, currentUser }: GuestCheckoutModalProps) => {
 const form = useForm<GuestCheckoutFormData>({
  resolver: zodResolver(guestCheckoutSchema),
  defaultValues: {
   firstName: '',
   lastName: '',
   email: '',
   addressDetail: '', // 🟢 NUEVO default value
   region: undefined, // 🟢 NUEVO default value
   commune: undefined, // 🟢 NUEVO default value
   rut: '', 
      courier: undefined, 
      paymentMethod: undefined, 
      branchOffice: undefined, 
  },
 });
    
  // 💡 Vemos los valores para la lógica condicional
  const courierValue = form.watch('courier');
  const selectedRegion = form.watch('region');
  
  const showBranchOffice = courierValue === 'retiro en tienda';
  const showAddressFields = courierValue === 'envio';
  
  // Lista de comunas dependiente de la región seleccionada
  const availableCommunes = selectedRegion ? COMUNAS_POR_REGION[selectedRegion] : [];

  // 🟢 EFECTO PARA AUTO-COMPLETAR DATOS
  useEffect(() => {
    if (isOpen && currentUser) {
        // Lógica simple para separar nombre y apellido
        const nameParts = currentUser.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Reseteamos el formulario con los datos del usuario
        form.reset({
            firstName: firstName,
            lastName: lastName,
            email: currentUser.email,
            rut: currentUser.rut,
            region: currentUser.region || undefined,
            // Importante: Mapeamos 'comuna' del usuario a 'commune' del formulario
            commune: currentUser.comuna || undefined, 
            addressDetail: currentUser.address || '',
            // Mantenemos vacíos los campos de selección de envío/pago
            courier: undefined,
            paymentMethod: undefined,
            branchOffice: undefined
        });
    } else if (isOpen && !currentUser) {
        // Si no hay usuario (es invitado real), limpiamos el formulario
        form.reset({
            firstName: '',
            lastName: '',
            email: '',
            rut: '',
            region: undefined,
            commune: undefined,
            addressDetail: '',
            courier: undefined,
            paymentMethod: undefined,
            branchOffice: undefined
        });
    }
 }, [isOpen, currentUser, form]);


 const onSubmit = (data: GuestCheckoutFormData) => {
    // Limpiamos los campos que no se usaron antes de enviar
    const finalData = {
        ...data,
        // Eliminamos campos de envío si es retiro
        addressDetail: data.courier === 'retiro en tienda' ? undefined : data.addressDetail,
        region: data.courier === 'retiro en tienda' ? undefined : data.region,
        commune: data.courier === 'retiro en tienda' ? undefined : data.commune,
        // Eliminamos sucursal si es envío
        branchOffice: data.courier === 'envio' ? undefined : data.branchOffice,
    };
  onConfirm(finalData as GuestCheckoutFormData); 
  onClose();
  form.reset();
 };

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="max-w-md bg-card border-border">
    <DialogHeader>
     <DialogTitle className="text-2xl text-accent">Datos de Envío y Pago</DialogTitle>
     <DialogDescription>
      Por favor, ingresa tus datos para completar la compra.
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
            
            {/* RUT */}
      <FormField
       control={form.control}
       name="rut"
       render={({ field }) => (
        <FormItem>
         <FormLabel>RUT / Identificación *</FormLabel>
         <FormControl>
          <Input placeholder="Ej: 12.345.678-9" className="bg-input border-border" {...field} />
         </FormControl>
         <FormMessage />
        </FormItem>
       )}
      />

      {/* Correo Electrónico */}
      <FormField
       control={form.control}
       name="email"
       render={({ field }) => (
        <FormItem>
         <FormLabel>Correo Electrónico *</FormLabel>
         <FormControl>
          <Input type="email" placeholder="correo@ejemplo.com" className="bg-input border-border" {...field} />
         </FormControl>
         <FormMessage />
        </FormItem>
       )}
      />
            
            {/* Courier (MÉTODO DE ENTREGA) */}
      <FormField
       control={form.control}
       name="courier"
       render={({ field }) => (
        <FormItem>
         <FormLabel>Método de Entrega *</FormLabel>
         <Select onValueChange={field.onChange} value={field.value || undefined}>
          <FormControl>
           <SelectTrigger className="bg-input border-border">
            <SelectValue placeholder="Selecciona el método de entrega" />
           </SelectTrigger>
          </FormControl>
          <SelectContent>
           {COURIERS.map(courier => (
                        <SelectItem key={courier.value} value={courier.value}>
                          {courier.label}
                        </SelectItem>
                      ))}
          </SelectContent>
         </Select>
         <FormMessage />
        </FormItem>
       )}
      />
            
            {/* 🟢 CAMPO CONDICIONAL: Sucursal (Aparece si courier === 'retiro en tienda') 🟢 */}
            {showBranchOffice && (
              <FormField
                control={form.control}
                name="branchOffice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sucursal de Retiro *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue placeholder="Selecciona la sucursal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUCURSALES.map(sucursal => (
                          <SelectItem key={sucursal.value} value={sucursal.value}>
                            {sucursal.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}


      {/* 🟢 CAMPOS CONDICIONALES DE ENVÍO (Aparece si courier === 'envio') 🟢 */}
            {showAddressFields && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Región */}
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Región *</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            // 💡 RESETEAMOS LA COMUNA AL CAMBIAR LA REGIÓN
                            form.setValue('commune', undefined); 
                          }} 
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-input border-border">
                              <SelectValue placeholder="Selecciona región" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {REGIONES.map(region => (
                              <SelectItem key={region.value} value={region.value}>
                                {region.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Comuna (Dependiente de la Región) */}
                  <FormField
                    control={form.control}
                    name="commune"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comuna *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined} disabled={!selectedRegion}>
                          <FormControl>
                            <SelectTrigger className="bg-input border-border">
                              <SelectValue placeholder="Selecciona comuna" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableCommunes.map(commune => (
                              <SelectItem key={commune.value} value={commune.value}>
                                {commune.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Detalle Dirección (Calle y Número) */}
                <FormField
                  control={form.control}
                  name="addressDetail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calle y Número *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Calle 123, Depto 402" className="bg-input border-border" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {/* Método de Pago */}
            <FormField
       control={form.control}
       name="paymentMethod"
       render={({ field }) => (
        <FormItem>
         <FormLabel>Método de Pago *</FormLabel>
         <Select onValueChange={field.onChange} value={field.value || undefined}>
          <FormControl>
           <SelectTrigger className="bg-input border-border">
            <SelectValue placeholder="Selecciona un método de pago" />
           </SelectTrigger>
          </FormControl>
          <SelectContent>
           {PAYMENT_METHODS.map(method => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
          </SelectContent>
         </Select>
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