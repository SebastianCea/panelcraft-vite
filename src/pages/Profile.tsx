import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCurrentUser, updateLocalSession } from '@/lib/service/authenticateUser';
import { updateUser } from '@/lib/userStorage';
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PublicHeader } from '@/components/public/PublicHeader';
import { useToast } from '@/hooks/use-toast';
import { User as UserIcon, Gift, Save, Calendar, Mail, Lock, Loader2, Pencil, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { pb } from '@/lib/pocketbase';

const profileSchema = z.object({
  email: z.string().email('Correo inválido').min(1, 'El correo es requerido'),
  // La contraseña es opcional al editar
  password: z.string().optional(), 
  birthDay: z.string().min(1, 'Día requerido'),
  birthMonth: z.string().min(1, 'Mes requerido'),
  birthYear: z.string().min(4, 'Año requerido'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // 🟢 ESTADOS PARA EDICIÓN Y SEGURIDAD
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loggedUser = getCurrentUser();
    if (!loggedUser) {
      navigate('/login');
      return;
    }
    // Asegurarse de que el usuario tenga un ID válido
    if (!loggedUser.id) {
        console.error("Usuario sin ID en sesión local. Redirigiendo...");
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

  // Función para resetear el formulario a los datos originales
  const resetFormToUserData = () => {
    if (user) {
      let year = '', month = '', day = '';
      if (user.birthdate) {
          // 🟢 Extraer solo la parte de la fecha (YYYY-MM-DD) eliminando la hora si existe
          const dateOnly = user.birthdate.split(' ')[0]; 
          const parts = dateOnly.split('-');
          if (parts.length === 3) {
              [year, month, day] = parts;
          }
      }

      form.reset({
        email: user.email,
        password: '',
        birthYear: year,
        birthMonth: month,
        birthDay: day,
      });
    }
  };

  useEffect(() => {
    resetFormToUserData();
  }, [user, form]);

  const onSubmit = async (data: ProfileFormData) => {
    // 🟢 VALIDACIÓN CRÍTICA: Asegurarse de que user.id existe
    if (!user || !user.id) {
        toast({
            title: 'Error de Sesión',
            description: 'No se pudo identificar al usuario. Por favor inicia sesión nuevamente.',
            variant: 'destructive',
        });
        return;
    }
    
    setIsSaving(true);

    const birthdateFormatted = `${data.birthYear}-${data.birthMonth.padStart(2, '0')}-${data.birthDay.padStart(2, '0')}`;

    const updates: Partial<User> = {
      email: data.email,
      birthdate: birthdateFormatted,
    };

    // Solo enviamos password si el usuario escribió algo (y es válido)
    if (data.password && data.password.length >= 6) {
        updates.password = data.password;
        // PocketBase requiere confirmación de contraseña también al actualizar
        (updates as any).passwordConfirm = data.password;
    }

    try {
        console.log("Actualizando usuario ID:", user.id); // Debug
        const updatedUser = await updateUser(user.id, updates);

        if (updatedUser) {
            // 🟢 CORRECCIÓN: Usamos updateLocalSession en lugar de login
            updateLocalSession(updatedUser);
            
            setUser(updatedUser);
            setIsEditing(false); // Salir del modo edición al guardar
            
            toast({
                title: 'Perfil Actualizado',
                description: 'Tus datos han sido guardados exitosamente.',
                className: 'bg-green-600 text-white border-none',
            });
        } else {
            throw new Error("La respuesta del servidor fue vacía.");
        }
    } catch (error: any) {
        console.error("Error al actualizar:", error);
        // Mostrar mensaje más detallado si viene de PocketBase
        const msg = error?.data?.message || error?.message || 'No se pudo actualizar el perfil.';
        toast({
            title: 'Error',
            description: msg,
            variant: 'destructive',
        });
    } finally {
        setIsSaving(false);
    }
  };

  // 🟢 MANEJADOR: Verificar contraseña para editar
  const handleVerifyPassword = async () => {
    if (!user) return;
    setIsVerifying(true);
    try {
        // Intentamos autenticar con la contraseña ingresada
        await pb.collection('users').authWithPassword(user.email, passwordInput);
        
        // Si pasa, es correcto
        setIsPasswordModalOpen(false);
        setPasswordInput("");
        setIsEditing(true);
        toast({ title: "Identidad Verificada", description: "Ahora puedes editar tus datos.", className: "bg-green-600 text-white border-none" });

    } catch (error) {
        toast({ title: "Contraseña Incorrecta", description: "No se pudo verificar tu identidad.", variant: "destructive" });
    } finally {
        setIsVerifying(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    resetFormToUserData(); // Revertir cambios
  };

  if (!user) return null;

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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-accent flex items-center gap-2">
                <UserIcon className="h-8 w-8" /> Mi Perfil
            </h1>
            {/* 🟢 BOTÓN EDITAR DATOS (Solo visible si NO está editando) */}
            {!isEditing && (
                <Button onClick={() => setIsPasswordModalOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Pencil className="mr-2 h-4 w-4" /> Editar Datos
                </Button>
            )}
          </div>

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

          <Card className="bg-card border-border mt-8">
            <CardHeader>
                <CardTitle className="text-xl text-accent flex justify-between items-center">
                    <span>Configuración de Cuenta</span>
                    {isEditing && <span className="text-sm text-green-500 font-normal px-2 py-1 bg-green-500/10 rounded">Modo Edición Activo</span>}
                </CardTitle>
                <CardDescription>
                    {isEditing ? "Puedes modificar tus datos abajo." : "Para modificar tus datos, presiona el botón 'Editar Datos' arriba."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2"><Mail className="h-4 w-4" /> Nuevo Correo</FormLabel>
                                        <FormControl><Input {...field} className="bg-input border-border" disabled={!isEditing} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2"><Lock className="h-4 w-4" /> Nueva Contraseña (Opcional)</FormLabel>
                                        <FormControl><Input type="password" {...field} className="bg-input border-border" placeholder={isEditing ? "Dejar vacío para mantener" : "********"} disabled={!isEditing} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Fecha de Nacimiento</FormLabel>
                            <div className="grid grid-cols-3 gap-4">
                                <FormField control={form.control} name="birthDay" render={({ field }) => (
                                    <FormItem><FormControl><Input placeholder="Día" className="bg-input border-border" {...field} disabled={!isEditing} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="birthMonth" render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <select className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm disabled:opacity-50" {...field} disabled={!isEditing}>
                                                <option value="">Mes</option>
                                                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="birthYear" render={({ field }) => (
                                    <FormItem><FormControl><Input placeholder="Año" className="bg-input border-border" {...field} disabled={!isEditing} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        </div>

                        {/* 🟢 BOTONES DE ACCIÓN (SOLO SI ESTÁ EDITANDO) */}
                        {isEditing && (
                            <div className="flex justify-end gap-2 pt-4 animate-in fade-in slide-in-from-bottom-2">
                                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                                    <X className="mr-2 h-4 w-4" /> Cancelar
                                </Button>
                                <Button type="submit" disabled={isSaving} className="bg-accent text-accent-foreground hover:bg-accent/90 md:w-auto">
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </div>
                        )}
                    </form>
                </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 🟢 MODAL DE VERIFICACIÓN DE CONTRASEÑA */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Verificar Identidad</DialogTitle>
                <DialogDescription>
                    Por seguridad, ingresa tu contraseña actual para habilitar la edición.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Input 
                    type="password" 
                    placeholder="Contraseña actual" 
                    value={passwordInput} 
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="bg-input border-border"
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleVerifyPassword} disabled={!passwordInput || isVerifying} className="bg-accent text-accent-foreground">
                    {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verificar"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Profile;