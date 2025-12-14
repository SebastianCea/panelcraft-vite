import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCurrentUser, login, updateLocalSession } from '@/lib/service/authenticateUser';
import { updateUser } from '@/lib/userStorage';
import { getOrders } from '@/lib/orderStorage';
import { User } from '@/types/user';
import { Order } from '@/types/order';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PublicHeader } from '@/components/public/PublicHeader';
import { useToast } from '@/hooks/use-toast';
import { User as UserIcon, Gift, Save, Calendar, Mail, Lock, ShoppingBag, Package, KeyRound, Pencil, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const profileSchema = z.object({
  email: z.string().email('Correo inválido').min(1, 'El correo es requerido'),
  currentPassword: z.string().min(1, 'Debes ingresar tu contraseña actual para guardar cambios'),
  newPassword: z.string().optional().refine(val => !val || val.length >= 6, {
    message: 'La nueva contraseña debe tener al menos 6 caracteres',
  }),
  birthDay: z.string().min(1, 'Día requerido'),
  birthMonth: z.string().min(1, 'Mes requerido'),
  birthYear: z.string().min(4, 'Año requerido'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState(false); // 🟢 Nuevo estado para controlar la edición
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: '',
      currentPassword: '',
      newPassword: '',
      birthDay: '',
      birthMonth: '',
      birthYear: '',
    },
  });

  useEffect(() => {
    const loggedUser = getCurrentUser();
    if (!loggedUser) {
      navigate('/login');
      return;
    }
    setUser(loggedUser);

    const fetchOrders = async () => {
      try {
        const allOrders = await getOrders();
        if (Array.isArray(allOrders)) {
            const userOrders = allOrders.filter(order => order.rutCliente === loggedUser.rut);
            setOrders(userOrders.reverse());
        }
      } catch (error) {
        console.error("Error cargando órdenes:", error);
      }
    };

    fetchOrders();
  }, [navigate]);

  // Función auxiliar para resetear el formulario con los datos actuales del usuario
  const resetFormToUserValues = (userData: User) => {
    const [year, month, day] = userData.birthdate ? userData.birthdate.split('-') : ['','',''];
    form.reset({
        email: userData.email,
        currentPassword: '',
        newPassword: '',
        birthYear: year,
        birthMonth: month,
        birthDay: day,
    });
  };

  useEffect(() => {
    if (user) {
        resetFormToUserValues(user);
    }
  }, [user]); // Quitamos 'form' de las dependencias para evitar loops

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) resetFormToUserValues(user); // Restaurar valores originales
    toast({ description: "Edición cancelada." });
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    try {
        const authCheck = await login({ 
            email: user.email, 
            password: data.currentPassword 
        });

        if (!authCheck.success) {
            toast({
                title: 'Error de Seguridad',
                description: 'La contraseña actual es incorrecta.',
                variant: 'destructive',
            });
            return;
        }

        const birthdateFormatted = `${data.birthYear}-${data.birthMonth.padStart(2, '0')}-${data.birthDay.padStart(2, '0')}`;

        const updates: any = {
            email: data.email,
            birthdate: birthdateFormatted,
        };

        if (data.newPassword && data.newPassword.trim() !== '') {
            updates.password = data.newPassword;
            updates.passwordConfirm = data.newPassword;
        }

        const updatedUser = await updateUser(user.id, updates);

        if (updatedUser) {
            setUser(updatedUser);
            updateLocalSession(updatedUser);
            setIsEditing(false); // 🟢 Salir del modo edición al guardar
            
            toast({
                title: 'Perfil Actualizado',
                description: 'Tus datos han sido guardados exitosamente.',
                className: 'bg-green-600 text-white border-none',
            });
        } else {
            throw new Error("No se pudo actualizar");
        }
    } catch (error) {
        console.error(error);
        toast({
            title: 'Error',
            description: 'No se pudo actualizar el perfil.',
            variant: 'destructive',
        });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(price);
  };

  if (!user) return null;

  const months = [
    { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' }, { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' }, { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' }, { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
   ];

  return (
    <div className="min-h-screen bg-background pb-10">
      <PublicHeader />
      
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <h1 className="text-3xl font-bold text-accent mb-8 flex items-center gap-2">
            <UserIcon className="h-8 w-8" /> Mi Perfil
          </h1>

          {/* ... (Tarjetas de Datos Personales y Beneficios se mantienen igual) ... */}
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

          {/* ... (Tarjeta Historial de Compras se mantiene igual) ... */}
          <Card className="bg-card border-border mt-8">
            <CardHeader>
                <CardTitle className="text-xl text-accent flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" /> Historial de Compras
                </CardTitle>
                <CardDescription>Revisa el estado de tus pedidos recientes.</CardDescription>
            </CardHeader>
            <CardContent>
                {orders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                        <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No has realizado compras aún.</p>
                        <Button variant="link" onClick={() => navigate('/categorias')} className="text-accent mt-2">
                            Ir a comprar
                        </Button>
                    </div>
                ) : (
                    <div className="rounded-md border border-border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Orden</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="hidden md:table-cell">Productos</TableHead>
                                    <TableHead className="text-right">Total Pagado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">#{order.id.slice(0, 6)}</TableCell>
                                        <TableCell>{order.date}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                order.statePedido === 'Recibido' ? 'border-green-500 text-green-500' : 
                                                order.statePedido === 'En camino' ? 'border-blue-500 text-blue-500' :
                                                'border-yellow-500 text-yellow-500'
                                            }>
                                                {order.statePedido}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell max-w-[200px]">
                                            <div className="flex flex-col gap-1">
                                                {order.items.slice(0, 2).map((item, idx) => (
                                                    <span key={idx} className="text-xs text-muted-foreground truncate">
                                                        {item.quantity}x {item.name}
                                                    </span>
                                                ))}
                                                {order.items.length > 2 && (
                                                    <span className="text-xs text-accent italic">
                                                        +{order.items.length - 2} más...
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-foreground">
                                            {formatPrice(order.finalTotal || order.total)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
          </Card>

          {/* 🟢 TARJETA DE EDICIÓN MEJORADA */}
          <Card className="bg-card border-border mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl text-foreground flex items-center gap-2">
                        <Save className="h-5 w-5" /> Datos de Cuenta
                    </CardTitle>
                    <CardDescription>Información privada de contacto y seguridad.</CardDescription>
                </div>
                {/* 🟢 Botón para Habilitar Edición */}
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                        <Pencil className="h-4 w-4" /> Editar Datos
                    </Button>
                )}
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
                                        <FormLabel className="flex items-center gap-2"><Mail className="h-4 w-4" /> Correo Electrónico</FormLabel>
                                        <FormControl>
                                            {/* 🟢 Disabled si no está editando */}
                                            <Input {...field} className="bg-input border-border" disabled={!isEditing} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-muted-foreground">
                                            <Lock className="h-4 w-4" /> Nueva Contraseña {isEditing && "(Opcional)"}
                                        </FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="password" 
                                                placeholder={isEditing ? "Escribe solo si deseas cambiarla" : "••••••••"} 
                                                {...field} 
                                                className="bg-input border-border"
                                                disabled={!isEditing} // 🟢 Disabled
                                            />
                                        </FormControl>
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
                                            <select 
                                                className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                                                {...field}
                                                disabled={!isEditing} // 🟢 Disabled
                                            >
                                                <option value="">Mes</option>
                                                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                            </select>
                                        </FormControl>
                                        <FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="birthYear" render={({ field }) => (
                                    <FormItem><FormControl><Input placeholder="Año" className="bg-input border-border" {...field} disabled={!isEditing} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        </div>

                        {/* 🟢 SECCIÓN DE CONFIRMACIÓN (SOLO VISIBLE AL EDITAR) */}
                        {isEditing && (
                            <div className="border-t border-border pt-6 mt-6 animate-in fade-in slide-in-from-top-4">
                                <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
                                    <h4 className="text-sm font-semibold text-accent mb-4 flex items-center gap-2">
                                        <KeyRound className="h-4 w-4" /> Confirmar Cambios
                                    </h4>
                                    <div className="flex flex-col md:flex-row gap-4 items-end">
                                        <FormField
                                            control={form.control}
                                            name="currentPassword"
                                            render={({ field }) => (
                                                <FormItem className="flex-1 w-full">
                                                    <FormLabel>Contraseña Actual (Requerida) *</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            type="password" 
                                                            placeholder="Ingresa tu contraseña para guardar" 
                                                            {...field} 
                                                            className="bg-input border-border" 
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <Button type="button" variant="ghost" onClick={handleCancelEdit} className="flex-1 md:flex-none gap-2">
                                                <X className="h-4 w-4" /> Cancelar
                                            </Button>
                                            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 flex-1 md:flex-none">
                                                Guardar Todo
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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