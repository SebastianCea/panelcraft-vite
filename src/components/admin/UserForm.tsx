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
import { useForm, useWatch } from 'react-hook-form'; // Importamos useWatch
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

// --- 1. DEFINICIÓN DEL ESQUEMA DE VALIDACIÓN ZOD ---

const userFormSchema = z.object({
    // Campos existentes
    rut: z.string()
        // 1. Limpieza: Elimina puntos y convierte a mayúsculas
        .transform(val => val.replace(/\./g, '').toUpperCase())
        // 2. Validación de formato (solo dígitos y exactamente un guion)
        .refine(val => /^[0-9K]{1,9}\-[0-9K]$/.test(val), {
            message: 'Formato de RUT inválido. Debe ser sin puntos y con guion (Ej: 12345678-K).',
        })
        .refine(val => val.length >= 10 && val.length <= 12, {
            message: 'El RUT debe tener entre 9 y 11 caracteres (sin contar puntos).',
        }),
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
    email: z.string().min(1, 'El email es requerido').email('Formato de correo inválido'),
    birthdate: z.string().min(1, 'La fecha de nacimiento es requerida'),
    userType: z.enum(['Cliente', 'Vendedor', 'Administrador'], {
        required_error: "El tipo de usuario es obligatorio.",
    }),
    address: z.string().min(10, 'La dirección es requerida y debe ser detallada').max(200),

    // 💡 NUEVOS CAMPOS: Región y Comuna
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
            // 💡 Valores por defecto para nuevos campos
            region: user?.region || '', 
            comuna: user?.comuna || '',
        },
    });

    // 🚀 Lógica de Dependencia de Campos con useWatch y useEffect:
    
    // 1. Observar el valor actual del campo 'region'
    const selectedRegion = useWatch({ control: form.control, name: 'region' });

    // 2. Usar useEffect para reaccionar cuando 'region' cambie
    useEffect(() => {
        // Cada vez que la región cambie (o se monte el componente si no hay valor inicial)
        
        // Si no hay una región seleccionada, reiniciamos la comuna a vacío.
        if (!selectedRegion) {
            form.setValue('comuna', '');
            return;
        }

        // 3. Buscar la lista de comunas para la región seleccionada
        const regionData = REGIONES_COMUNAS.find(r => r.region === selectedRegion);
        
        // 4. Si la comuna actual no pertenece a la nueva región, la limpiamos.
        // Esto evita que quede una comuna de la Región A si el usuario cambia a la Región B.
        if (regionData && !regionData.comunas.includes(form.getValues('comuna'))) {
            form.setValue('comuna', '');
        }

        // Agregamos form.getValues y form.setValue como dependencias solo para satisfacer eslint.
        // La lógica está centrada en reaccionar a selectedRegion.
    }, [selectedRegion, form.setValue, form.getValues]);

    // 5. Obtener la lista de comunas que se mostrarán en el Select
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
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
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