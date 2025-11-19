import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCurrentUser, login } from '@/lib/service/authenticateUser';
import { updateUser } from '@/lib/userStorage';
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PublicHeader } from '@/components/public/PublicHeader';
import { useToast } from '@/hooks/use-toast';
import { User as UserIcon, Gift, Save, Calendar, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Esquema de validación para edición de perfil
const profileSchema = z.object({
  email: z.string().email('Correo inválido').min(1, 'El correo es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(20, 'Máximo 20 caracteres'),
  birthDay: z.string().min(1, 'Día requerido'),
  birthMonth: z.string().min(1, 'Mes requerido'),
  birthYear: z.string().min(4, 'Año requerido'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Cargar usuario al montar
  useEffect(() => {
    const loggedUser = getCurrentUser();
    if (!loggedUser) {
      navigate('/login');
      return;
    }
    setUser(loggedUser);
  }, [navigate]);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: '',
      password: '',
      birthDay: '',
      birthMonth: '',
      birthYear: '',
    },
  });

  // Actualizar valores del formulario cuando carga el usuario
  useEffect(() => {
    if (user) {
      const [year, month, day] = user.birthdate.split('-');
      form.reset({
        email: user.email,
        password: user.password,
        birthYear: year,
        birthMonth: month,
        birthDay: day,
      });
    }
  }, [user, form]);

  const onSubmit = (data: ProfileFormData) => {
    if (!user) return;

    const birthdateFormatted = `${data.birthYear}-${data.birthMonth.padStart(2, '0')}-${data.birthDay.padStart(2, '0')}`;

    // Objeto con los cambios
    const updates: Partial<User> = {
      email: data.email,
      password: data.password,
      birthdate: birthdateFormatted,
    };

    // 1. Actualizar en localStorage (Base de datos simulada)
    const updatedUser = updateUser(user.id, updates);

    if (updatedUser) {
      // 2. Actualizar sesión actual
      login(updatedUser);
      setUser(updatedUser);
      
      toast({
        title: 'Perfil Actualizado',
        description: 'Tus datos han sido guardados exitosamente.',
        className: 'bg-green-600 text-white border-none',
      });
    } else {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el perfil.',
        variant: 'destructive',
      });
    }
  };

  if (!user) return null;

  // Helper para meses
  const months = [
    { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' }, { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' }, { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' }, { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
   ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-6">
          
          <h1 className="text-3xl font-bold text-accent mb-8 flex items-center gap-2">
            <UserIcon className="h-8 w-8" /> Mi Perfil
          </h1>

          {/* TARJETA DE INFORMACIÓN Y DESCUENTO */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Datos Personales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-muted-foreground">Nombre:</p>
                    <p className="text-lg font-semibold">{user.name}</p>
                    <div className="border-t border-border/50 my-2" />
                    <p className="text-muted-foreground">RUT:</p>
                    <p className="text-lg font-semibold">{user.rut}</p>
                </CardContent>
            </Card>

            <Card className={`border-border ${user.discountPercentage ? 'bg-accent/10 border-accent/50' : 'bg-card'}`}>
                <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                        <Gift className={user.discountPercentage ? "text-accent" : "text-muted-foreground"} />
                        Beneficios
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {user.discountPercentage ? (
                        <div className="text-center py-2">
                            <p className="text-4xl font-bold text-accent mb-1">{user.discountPercentage}% OFF</p>
                            <p className="text-green-400 font-medium">Descuento Vitalicio Activo</p>
                            <p className="text-xs text-muted-foreground mt-2">Aplicable automáticamente en tu carrito por ser DuocUC.</p>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-muted-foreground">
                            <p>No tienes descuentos activos actualmente.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
          </div>

          {/* FORMULARIO DE EDICIÓN */}
          <Card className="bg-card border-border mt-8">
            <CardHeader>
                <CardTitle className="text-xl text-accent">Editar Datos de Cuenta</CardTitle>
                <CardDescription>Actualiza tu correo, contraseña o fecha de nacimiento.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Email */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2"><Mail className="h-4 w-4" /> Nuevo Correo</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="bg-input border-border" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Password */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2"><Lock className="h-4 w-4" /> Nueva Contraseña</FormLabel>
                                        <FormControl>
                                            <Input type="text" {...field} className="bg-input border-border" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Fecha de Nacimiento */}
                        <div className="space-y-2">
                            <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Fecha de Nacimiento</FormLabel>
                            <div className="grid grid-cols-3 gap-4">
                                <FormField control={form.control} name="birthDay" render={({ field }) => (
                                    <FormItem><FormControl><Input placeholder="Día" className="bg-input border-border" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="birthMonth" render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <select 
                                                className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                {...field}
                                            >
                                                <option value="">Mes</option>
                                                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="birthYear" render={({ field }) => (
                                    <FormItem><FormControl><Input placeholder="Año" className="bg-input border-border" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full md:w-auto">
                                <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Profile;