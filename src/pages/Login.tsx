import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';
import { authenticateUser, login } from '@/lib/service/authenticateUser'; 

const Login = () => {
 const { toast } = useToast();
 const navigate = useNavigate();

 const form = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
  defaultValues: {
   email: '',
   password: '',
  },
 });

 const onSubmit = (data: LoginFormData) => {
  try {
    // 1. Autenticar
    const user = authenticateUser(data); 
    
    // 2. 🟢 GUARDAR SESIÓN
        login(user);

    toast({
      title: `¡Bienvenido de nuevo, ${user.name}!`,
      description: 'Has iniciado sesión correctamente.',
            className: "bg-green-500 text-white border-none"
    });
    
    // 3. 🚦 LÓGICA DE REDIRECCIÓN SEGÚN ROL 🚦
    setTimeout(() => {
            // Si es personal de la empresa, al panel.
            if (user.userType === 'Administrador' || user.userType === 'Vendedor') {
                navigate('/admin');
            } 
            // Si es cliente, a la tienda.
            else {
                navigate('/home'); 
            }
    }, 500);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error al iniciar sesión";
    
    toast({
      title: 'Acceso Denegado',
      description: errorMessage,
      variant: 'destructive'
    });
  }
 };

 return (
  <div className="min-h-screen flex items-center justify-center bg-background p-4 py-8">
   <Card className="w-full max-w-sm bg-card border-border shadow-lg">
    <CardHeader className="space-y-1">
     <CardTitle className="text-3xl font-bold text-accent text-center">Iniciar Sesión</CardTitle>
     <CardDescription className="text-center">
      Ingresa a tu cuenta de Level-Up Gamer
     </CardDescription>
    </CardHeader>
    <CardContent>
     <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
       
       <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
         <FormItem>
          <FormLabel>Correo Electrónico</FormLabel>
          <FormControl>
           <Input 
            placeholder="ejemplo@correo.com" 
            className="bg-input border-border" 
            {...field} 
           />
          </FormControl>
          <FormMessage />
         </FormItem>
        )}
       />

       <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
         <FormItem>
          <FormLabel>Contraseña</FormLabel>
          <FormControl>
           <Input 
            type="password" 
            placeholder="••••••••" 
            className="bg-input border-border" 
            {...field} 
           />
          </FormControl>
          <FormMessage />
         </FormItem>
        )}
       />
       
       <Button 
        type="submit" 
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold"
       >
        <LogIn className="h-5 w-5 mr-2" />
        Entrar
       </Button>
      </form>
     </Form>
     
     <div className="mt-6 flex flex-col gap-2 text-center text-sm">
      <Link to="/recuperar-contrasena" className="text-muted-foreground hover:text-primary transition-colors">
       ¿Olvidaste tu contraseña?
      </Link>
            <div className="text-muted-foreground">
                ¿No tienes cuenta?{' '}
                <Link to="/registro" className="text-accent hover:underline font-medium">
                  Regístrate aquí
                </Link>
            </div>
            <div className="mt-2 pt-4 border-t border-border">
          <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
           ← Volver
          </Link>
            </div>
     </div>
    
    </CardContent>
   </Card>
  </div>
 );
};

export default Login;