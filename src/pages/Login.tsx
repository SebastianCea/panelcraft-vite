import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
// 🟢 CORRECCIÓN: Importamos 'login' en lugar de 'authenticateUser'
import { login } from '@/lib/service/authenticateUser'; 
import { Loader2 } from 'lucide-react';
import { LoginCredentials } from '@/types/user';

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 🟢 CORRECCIÓN: La función onSubmit ahora es async
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // 1. Intentar iniciar sesión (esperamos la promesa)
      // 🟢 CORRECCIÓN DE TIPO: Nos aseguramos de que data cumpla con LoginCredentials
      // Como el esquema de validación (loginSchema) ya asegura que email y password no están vacíos,
      // podemos hacer el cast o asegurarnos de que pasamos strings.
      const credentials: LoginCredentials = {
          email: data.email || "",
          password: data.password || ""
      };

      const response = await login(credentials); 
      
      if (response.success && response.user) {
        const user = response.user;

        toast({
          title: `¡Bienvenido de nuevo, ${user.name}!`,
          description: 'Has iniciado sesión correctamente.',
          className: "bg-green-600 text-white border-none"
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
        }, 1000);
      } else {
        // Si falló el login (credenciales incorrectas)
        throw new Error(response.message || "Credenciales incorrectas");
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al iniciar sesión";
      
      toast({
        title: 'Acceso Denegado',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-accent">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="correo@ejemplo.com" {...field} className="bg-input border-border" />
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
                      <Input type="password" placeholder="••••••••" {...field} className="bg-input border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Conectando...
                    </>
                ) : (
                    'Ingresar'
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-4 text-center text-sm">
            <Link to="/recuperar-contrasena" className="text-muted-foreground hover:text-accent">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="mt-2 text-center text-sm">
            <span className="text-muted-foreground">¿No tienes cuenta? </span>
            <Link to="/registro" className="text-accent hover:underline font-medium">
              Regístrate aquí
            </Link>
          </div>
          <div className="mt-4 text-center text-sm">
            <Link to="/" className="text-muted-foreground hover:underline">
              ← Volver a la tienda
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;