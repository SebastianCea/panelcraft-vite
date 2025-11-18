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

// 💡 IMPORTS ADICIONALES PARA VALIDACIÓN
import { useForm, useWatch } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


// --- DEFINICIÓN DE DATOS CHILENOS (EJEMPLO) ---
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

// --- CONFIGURACIÓN DE DOMINIOS PERMITIDOS ---
const ALLOWED_DOMAINS = [
    'gmail\\.com', 'gmail\\.cl', 
    'outlook\\.com', 'outlook\\.cl', 
    'duocuc\\.cl', 
    'levelup\\.admin\\.cl', 
    'levelup\\.seller\\.cl' 
].join('|');

const EMAIL_REGEX = new RegExp(`^[\\w\\.-]+@(${ALLOWED_DOMAINS})$`, 'i'); 
const EMAIL_DOMAIN_ERROR = `El correo debe ser de un dominio permitido.`;

// --- FUNCIONES AUXILIARES ---

// Función que valida la estructura final del RUT
const validateRutFormat = (val: string) => {
    return /^[0-9K]{1,9}\-[0-9K]$/.test(val);
};

// --- 1. DEFINICIÓN DEL ESQUEMA DE VALIDACIÓN ZOD ---

const userFormSchema = z.object({
    // 🟢 CORRECCIÓN DE RUT
    rut: z.preprocess(
        // Preprocess: Limpia puntos y convierte a mayúsculas
        (val) => (typeof val === 'string' ? val.replace(/\./g, '').toUpperCase() : val),
        
        // Zod String: Valida el string limpiado
        z.string()
            .min(1, 'El RUT es requerido')
            // 1. Refine: Aseguramos el formato final (sin puntos, con guion)
            .refine(validateRutFormat, {
                message: 'Formato inválido. Debe ser sin puntos y con guion (Ej: 12345678-K).',
            })
    ),
    
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
    
    // 💡 CORRECCIÓN CLAVE AQUÍ: Aplicamos .regex(EMAIL_REGEX, ...)
    email: z.string()
        .min(1, 'El email es requerido')
        .email('Formato de correo inválido')
        .regex(EMAIL_REGEX, EMAIL_DOMAIN_ERROR), // <--- APLICADO EL FILTRO DE DOMINIO
        
    birthdate: z.string().min(1, 'La fecha de nacimiento es requerida'),
    userType: z.enum(['Cliente', 'Vendedor', 'Administrador'], {
        required_error: "El tipo de usuario es obligatorio.",
    }),
    address: z.string().min(10, 'La dirección es requerida y debe ser detallada').max(200),

    // Nuevos campos de ubicación
    region: z.string().min(1, 'La Región es requerida'),
    comuna: z.string().min(1, 'La Comuna es requerida'),
});

type ValidatedUserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
user?: User | null;
onSubmit: (data: ValidatedUserFormData) => void; 
onCancel: () => void;
}

// --- 2. CONVERSIÓN DEL COMPONENTE A RHF ---

export const UserForm = ({ user, onSubmit, onCancel }: UserFormProps) => {

  const form = useForm<ValidatedUserFormData>({
    resolver: zodResolver(userFormSchema), 
    defaultValues: {
      rut: user?.rut || '',
      name: user?.name || '',
      email: user?.email || '',
      birthdate: user?.birthdate || '',
      userType: user?.userType || 'Cliente',
      address: user?.address || '',
      region: user?.region || '', 
      comuna: user?.comuna || '',
    },
    mode: 'onBlur', 
  });

  // 🚀 Lógica de Dependencia de Campos con useWatch y useEffect:
  
  const selectedRegion = useWatch({ control: form.control, name: 'region' });

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

  const comunasDisponibles = REGIONES_COMUNAS.find(
    r => r.region === selectedRegion
  )?.comunas || [];


// Función de envío (solo se llama si la validación Zod es exitosa)
const handleSubmit = (data: ValidatedUserFormData) => {
 onSubmit(data);
};

return (
 <Form {...form}>
  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
   <div className="grid gap-4 md:grid-cols-2">
   
      {/* --- CAMPO: RUT --- */}
      <FormField
        control={form.control}
        name="rut"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="rut">RUT *</FormLabel>
            <FormControl>
              <Input
                id="rut"
                placeholder="12345678-9"
                className="bg-input border-border"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* --- CAMPO: Nombre Completo --- */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="name">Nombre Completo *</FormLabel>
            <FormControl>
              <Input
                id="name"
                placeholder="Juan Pérez"
                className="bg-input border-border"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

   {/* --- CAMPO: Email --- */}
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="email">Email *</FormLabel>
            <FormControl>
              <Input
                id="email"
                type="email"
                placeholder="juan@example.com"
                className="bg-input border-border"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

   {/* --- CAMPO: Fecha de Nacimiento --- */}
      <FormField
        control={form.control}
        name="birthdate"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="birthdate">Fecha de Nacimiento *</FormLabel>
            <FormControl>
              <Input
                id="birthdate"
                type="date"
                className="bg-input border-border"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

   {/* --- CAMPO: Tipo de Usuario (Select) --- */}
      <FormField
        control={form.control}
        name="userType"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="userType">Tipo de Usuario *</FormLabel>
            <Select
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
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

      {/* --- NUEVO CAMPO: Región --- */}
      <FormField
        control={form.control}
        name="region"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="region">Región *</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                // Limpia la comuna al cambiar la región para evitar datos incorrectos
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

      {/* --- NUEVO CAMPO: Comuna (Dependiente de Región) --- */}
      <FormField
        control={form.control}
        name="comuna"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="comuna">Comuna *</FormLabel>
            <Select
              onValueChange={field.onChange} 
              value={field.value} // Usamos value aquí para que se limpie cuando la región cambie
              disabled={!selectedRegion || comunasDisponibles.length === 0} // Deshabilitado si no hay región
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

   {/* --- CAMPO: Dirección (ahora solo contendrá calle, etc.) --- */}
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