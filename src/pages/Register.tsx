import { Link, useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { useToast } from '@/hooks/use-toast';
import { addUser } from '@/lib/userStorage'; 
// import { UserFormData } from '@/types/user'; // 🟢 Ya no necesitamos importar esto aquí si no lo usamos explícitamente en newUser
import { useEffect } from 'react';

// ... (constantes REGIONES_SIMULADAS y COMUNAS_POR_REGION_SIMULADAS igual que antes) ...
const REGIONES_SIMULADAS = [
    { value: 'Región Metropolitana', label: 'Región Metropolitana' },
    { value: 'Región de Valparaíso', label: 'Región de Valparaíso' },
    { value: 'Región del Biobío', label: 'Región del Biobío' },
];

const COMUNAS_POR_REGION_SIMULADAS: Record<string, { value: string; label: string }[]> = {
    'Región Metropolitana': [
        { value: 'Santiago', label: 'Santiago' },
        { value: 'Providencia', label: 'Providencia' },
    ],
    'Región de Valparaíso': [
        { value: 'Valparaíso', label: 'Valparaíso' },
        { value: 'Viña del Mar', label: 'Viña del Mar' },
    ],
    'Región del Biobío': [
        { value: 'Concepción', label: 'Concepción' },
        { value: 'Talcahuano', label: 'Talcahuano' },
    ],
};

const Register = () => {
 const { toast } = useToast();
 const navigate = useNavigate();

 const form = useForm<RegisterFormData>({
  resolver: zodResolver(registerSchema),
  defaultValues: {
   firstName: '',
   lastName: '',
   rut: '',
   birthYear: '',
   birthMonth: '',
   birthDay: '',
   email: '',
   password: '',
   repassword: '',
   region: '',
   city: '', 
   street: '', 
  },
 });
    
  const selectedRegion = useWatch({ control: form.control, name: 'region' });

  useEffect(() => {
    form.setValue('city', '');
  }, [selectedRegion, form.setValue]);
    
  const availableCommunes = COMUNAS_POR_REGION_SIMULADAS[selectedRegion as string] || [];

 const onSubmit = async (data: RegisterFormData) => { 
 
  const birthdateFormatted = `${data.birthYear}-${data.birthMonth.padStart(2, '0')}-${data.birthDay.padStart(2, '0')}`;
  const rutCleaned = data.rut.replace(/\./g, '').toUpperCase();
  
  const isDuocStudent = data.email.toLowerCase().endsWith('@duocuc.cl');
  const assignedDiscount = isDuocStudent ? 20 : 0; 

  // 🟢 CORRECCIÓN: No le ponemos ": UserFormData" para permitir propiedades extra como passwordConfirm
  const newUser = {
    rut: rutCleaned,
    email: data.email,
    password: data.password,
    passwordConfirm: data.repassword, // 🟢 Ahora sí es válido
    birthdate: birthdateFormatted,
    name: `${data.firstName} ${data.lastName}`, 
    region: data.region, 
    comuna: data.city, 
    address: data.street, 
    userType: 'Cliente' as const, // "as const" para que sea literal "Cliente"
    discountPercentage: assignedDiscount, 
  };

  try {
    // 🟢 Ahora newUser cumple con lo que pide addUser (User + passwordConfirm)
    await addUser(newUser); 
    
    if (isDuocStudent) {
        toast({
            title: '¡Registro Exitoso con Beneficio!', 
            description: `Bienvenido. Por usar tu correo DuocUC tienes un 20% de descuento permanente.`, 
            className: "bg-green-600 text-white border-none"
        });
    } else {
        toast({
            title: 'Registro Exitoso', 
            description: `Bienvenido(a) ${data.firstName}. Serás redirigido a la tienda.`, 
        });
    }

    setTimeout(() => {
      navigate('/'); 
    }, 2000);

  } catch (error) {
    console.error("Error al guardar el usuario:", error);
    const errorMessage = (error as any)?.data?.message || 'No se pudo crear la cuenta. Verifica tus datos.';
        
    toast({
      title: 'Error de Registro',
      description: errorMessage,
      variant: 'destructive'
    });
  }
};

 const months = [
  { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' }, { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' }, { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' }, { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
 ];

 return (
  <div className="min-h-screen flex items-center justify-center bg-background p-4 py-8">
   <Card className="w-full max-w-2xl bg-card border-border">
    <CardHeader>
     <CardTitle className="text-3xl text-accent">Crear Cuenta</CardTitle>
     <CardDescription>
      Completa todos los campos para registrarte
     </CardDescription>
    </CardHeader>
    <CardContent>
     <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
       
       <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Información Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <FormField control={form.control} name="firstName" render={({ field }) => (
           <FormItem><FormLabel>Nombre *</FormLabel><FormControl><Input placeholder="Ej: Juan" className="bg-input border-border" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
         <FormField control={form.control} name="lastName" render={({ field }) => (
           <FormItem><FormLabel>Apellido *</FormLabel><FormControl><Input placeholder="Ej: Pérez" className="bg-input border-border" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <FormField control={form.control} name="rut" render={({ field }) => (
           <FormItem><FormLabel>RUT (sin puntos, con guión) *</FormLabel><FormControl><Input placeholder="12345678-9" className="bg-input border-border" {...field} onChange={(e) => field.onChange(e.target.value.replace(/\./g, ''))} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
       </div>

       <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Fecha de Nacimiento *</h3>
        <div className="grid grid-cols-3 gap-4">
         <FormField control={form.control} name="birthDay" render={({ field }) => (
           <FormItem><FormLabel>Día</FormLabel><FormControl><Input type="number" min="1" max="31" placeholder="DD" className="bg-input border-border" {...field} onChange={(e) => field.onChange(e.target.value.slice(0, 2))} /></FormControl><FormMessage /></FormItem>
          )} />
         <FormField control={form.control} name="birthMonth" render={({ field }) => (
           <FormItem><FormLabel>Mes</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="bg-input border-border"><SelectValue placeholder="Mes" /></SelectTrigger></FormControl><SelectContent>{months.map((month) => (<SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
          )} />
         <FormField control={form.control} name="birthYear" render={({ field }) => (
           <FormItem><FormLabel>Año</FormLabel><FormControl><Input type="number" min="1900" max={new Date().getFullYear()} placeholder="AAAA" className="bg-input border-border" {...field} onChange={(e) => field.onChange(e.target.value.slice(0, 4))} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
       </div>

       <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Credenciales *</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <FormField control={form.control} name="email" render={({ field }) => (
           <FormItem><FormLabel>Correo Electrónico *</FormLabel><FormControl><Input type="email" placeholder="correo@ejemplo.com" className="bg-input border-border" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
         <FormField control={form.control} name="password" render={({ field }) => (
           <FormItem><FormLabel>Ingrese nueva contraseña *</FormLabel><FormControl><Input type="password" placeholder="" className="bg-input border-border" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
         <FormField control={form.control} name="repassword" render={({ field }) => (
           <FormItem><FormLabel>Repita nueva contraseña *</FormLabel><FormControl><Input type="password" placeholder="" className="bg-input border-border" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
       </div>

       <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Dirección *</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <FormField control={form.control} name="region" render={({ field }) => (
           <FormItem><FormLabel>Región *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="bg-input border-border"><SelectValue placeholder="Selecciona tu región" /></SelectTrigger></FormControl><SelectContent>{REGIONES_SIMULADAS.map(r => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <FormField control={form.control} name="city" render={({ field }) => (
           <FormItem><FormLabel>Comuna *</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedRegion}><FormControl><SelectTrigger className="bg-input border-border"><SelectValue placeholder="Selecciona tu comuna" /></SelectTrigger></FormControl><SelectContent>{availableCommunes.map(c => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
          )} />
         <FormField control={form.control} name="street" render={({ field }) => (
           <FormItem className='md:col-span-2'><FormLabel>Calle, Número, Depto. *</FormLabel><FormControl><Input placeholder="Ej: Av. Principal 1234, Depto 5A" className="bg-input border-border" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
       </div>

       <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={form.formState.isSubmitting}>Crear Cuenta</Button>
      </form>
     </Form>

     <div className="text-center text-sm mt-6">
      <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
      <Link to="/login" className="text-accent hover:underline font-medium">Iniciar sesión</Link>
     </div>
     <div className="text-center text-sm mt-4">
      <Link to="/" className="text-muted-foreground hover:underline">← Volver a la tienda</Link>
     </div>
    </CardContent>
   </Card>
  </div>
 );
};

export default Register;