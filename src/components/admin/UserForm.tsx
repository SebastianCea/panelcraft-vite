import { useState, useEffect } from 'react';
import { User, UserFormData } from '@/types/user'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { useForm, useWatch } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


// --- DEFINICIÓN DE DATOS CHILENOS ---
const REGIONES_COMUNAS = [
    { 
        region: 'Región Metropolitana', 
        comunas: ['Santiago', 'Providencia', 'Las Condes', 'Ñuñoa'] 
    },
    { 
        region: 'Región de Valparaíso', 
        comunas: ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana'] 
    },
    { 
        region: 'Región del Biobío', 
        comunas: ['Concepción', 'Talcahuano', 'San Pedro de la Paz'] 
    },
];

// --- CONFIGURACIÓN DE DOMINIOS ---
const DOMAIN_ADMIN = '@levelup.admin.cl';
const DOMAIN_SELLER = '@levelup.seller.cl';
const DOMAIN_CLIENT = '@levelup.cl'; // 🟢 NUEVO: Dominio por defecto para clientes

const ALLOWED_DOMAINS = [
    'gmail\\.com', 'gmail\\.cl', 
    'outlook\\.com', 'outlook\\.cl', 
    'duocuc\\.cl', 
    'levelup\\.cl', // 🟢 AÑADIDO
    'levelup\\.admin\\.cl', 
    'levelup\\.seller\\.cl' 
].join('|');

const EMAIL_REGEX = new RegExp(`^[\\w\\.-]+@(${ALLOWED_DOMAINS})$`, 'i'); 
const EMAIL_DOMAIN_ERROR = `El correo debe ser de un dominio permitido.`;

const validateRutFormat = (val: string) => {
    return /^[0-9K]{1,9}\-[0-9K]$/.test(val);
};

// --- 1. ESQUEMA DE VALIDACIÓN ---

const userFormSchema = z.object({
    rut: z.preprocess(
        (val) => (typeof val === 'string' ? val.replace(/\./g, '').toUpperCase() : val),
        z.string()
            .min(1, 'El RUT es requerido')
            .refine(validateRutFormat, {
                message: 'Formato inválido (Ej: 12345678-K).',
            })
    ),
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
    
    email: z.string()
        .min(1, 'El email es requerido')
        .email('Formato de correo inválido')
        .regex(EMAIL_REGEX, EMAIL_DOMAIN_ERROR), 

    password: z.string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .max(20, 'Máximo 20 caracteres'),
        
    birthdate: z.string().min(1, 'La fecha de nacimiento es requerida'),
    userType: z.enum(['Cliente', 'Vendedor', 'Administrador'], {
        required_error: "El tipo de usuario es obligatorio.",
    }),
    address: z.string().min(5, 'La dirección es requerida').max(200),

    region: z.string().min(1, 'La Región es requerida'),
    comuna: z.string().min(1, 'La Comuna es requerida'),
});

type ValidatedUserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
user?: User | null;
onSubmit: (data: ValidatedUserFormData) => void; 
onCancel: () => void;
}

export const UserForm = ({ user, onSubmit, onCancel }: UserFormProps) => {

  const form = useForm<ValidatedUserFormData>({
    resolver: zodResolver(userFormSchema), 
    defaultValues: {
      rut: user?.rut || '',
      name: user?.name || '',
      email: user?.email || '',
            password: user?.password || '', 
      birthdate: user?.birthdate || '',
      userType: user?.userType || 'Cliente',
      address: user?.address || '',
      region: user?.region || '', 
      comuna: user?.comuna || '',
    },
    mode: 'onBlur', 
  });

    // Observamos cambios en Región y Tipo de Usuario
  const selectedRegion = useWatch({ control: form.control, name: 'region' });
    const selectedUserType = useWatch({ control: form.control, name: 'userType' });

    // Lógica de Comunas
  useEffect(() => {
    if (!selectedRegion) {
      form.setValue('comuna', '');
      return;
    }
    const regionData = REGIONES_COMUNAS.find(r => r.region === selectedRegion);
    if (regionData && !regionData.comunas.includes(form.getValues('comuna'))) {
      form.setValue('comuna', '');
    }
  }, [selectedRegion, form.setValue, form.getValues]);

    // 🚀 LÓGICA DE DOMINIO AUTOMÁTICO (ACTUALIZADA)
    useEffect(() => {
        const currentEmail = form.getValues('email') || '';
        const emailUser = currentEmail.split('@')[0]; 

        // Asignación automática para TODOS los tipos
        if (selectedUserType === 'Administrador') {
            form.setValue('email', emailUser + DOMAIN_ADMIN);
        } else if (selectedUserType === 'Vendedor') {
            form.setValue('email', emailUser + DOMAIN_SELLER);
        } else if (selectedUserType === 'Cliente') {
            // 🟢 Ahora Cliente también tiene dominio forzado por defecto
            form.setValue('email', emailUser + DOMAIN_CLIENT);
        }
    }, [selectedUserType, form.setValue, form.getValues]);


  const comunasDisponibles = REGIONES_COMUNAS.find(
    r => r.region === selectedRegion
  )?.comunas || [];


const handleSubmit = (data: ValidatedUserFormData) => {
 onSubmit(data);
};

return (
 <Form {...form}>
  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
   <div className="grid gap-4 md:grid-cols-2">
   
            {/* RUT */}
      <FormField
        control={form.control}
        name="rut"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>RUT *</FormLabel>
            <FormControl>
              <Input placeholder="12345678-9" className="bg-input border-border" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
            {/* Nombre */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Nombre Completo *</FormLabel>
            <FormControl>
              <Input placeholder="Juan Pérez" className="bg-input border-border" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

            {/* 🟢 EMAIL INTELIGENTE (UNIFICADO) 🟢 */}
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => {
                    // Determinamos el sufijo dinámicamente
                    let domainSuffix = DOMAIN_CLIENT; // Por defecto
                    if (selectedUserType === 'Administrador') domainSuffix = DOMAIN_ADMIN;
                    if (selectedUserType === 'Vendedor') domainSuffix = DOMAIN_SELLER;

                    const displayValue = field.value.includes('@') ? field.value.split('@')[0] : field.value;
                    
                    return (
                        <FormItem className="space-y-2">
                            <FormLabel>Email *</FormLabel>
                            <div className="flex items-center">
                                <FormControl>
                                    <Input 
                                        {...field}
                                        value={displayValue} 
                                        onChange={(e) => {
                                            // Al escribir, añadimos el dominio activo automáticamente
                                            field.onChange(e.target.value + domainSuffix);
                                        }}
                                        placeholder="nombre.usuario" 
                                        className="bg-input border-border rounded-r-none" 
                                    />
                                </FormControl>
                                {/* Etiqueta visual del dominio */}
                                <div className="bg-secondary text-secondary-foreground px-3 py-2 rounded-r-md border border-l-0 border-border text-sm whitespace-nowrap flex items-center h-10">
                                    {domainSuffix}
                                </div>
                            </div>
                            <FormMessage />
                        </FormItem>
                    );
                }}
      />

            {/* Contraseña */}
            <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Contraseña *</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Asigna una contraseña" className="bg-input border-border" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

            {/* Fecha de Nacimiento */}
      <FormField
        control={form.control}
        name="birthdate"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Fecha de Nacimiento *</FormLabel>
            <FormControl>
              <Input type="date" className="bg-input border-border" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

            {/* Tipo de Usuario */}
      <FormField
        control={form.control}
        name="userType"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Tipo de Usuario *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Selecciona el tipo" />
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

            {/* Región */}
      <FormField
        control={form.control}
        name="region"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Región *</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                form.setValue('comuna', '');
              }} 
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Selecciona una región" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {REGIONES_COMUNAS.map((rc) => (
                  <SelectItem key={rc.region} value={rc.region}>
                    {rc.region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

            {/* Comuna */}
      <FormField
        control={form.control}
        name="comuna"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="comuna">Comuna *</FormLabel>
            <Select
              onValueChange={field.onChange} 
              value={field.value} 
              disabled={!selectedRegion || comunasDisponibles.length === 0} 
            >
              <FormControl>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder={selectedRegion ? "Selecciona una comuna" : "Primero selecciona una región"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {comunasDisponibles.map((comuna) => (
                  <SelectItem key={comuna} value={comuna}>
                    {comuna}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

            {/* Dirección */}
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem className="space-y-2 md:col-span-2">
            <FormLabel htmlFor="address">Dirección (Calle, Número, Detalle) *</FormLabel>
            <FormControl>
              <Input
                id="address"
                placeholder="Av. Los Naranjos 456, Depto 101"
                className="bg-input border-border"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
            
   </div>

     <div className="flex justify-end gap-3">
      <Button type="button" variant="outline" onClick={onCancel}>
       Cancelar
      </Button>
      <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
       {user ? 'Actualizar' : 'Crear'} Usuario
      </Button>
     </div>
    </form>
    </Form>
 );
};