import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    console.log('Login:', { ...data, isAdmin });
    toast({
      title: 'Formulario válido',
      description: 'Datos listos para enviar al backend',
    });
    // Aquí se integrará con el backend de Spring Boot
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl text-accent">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
            <Label htmlFor="admin-mode" className="text-foreground">
              {isAdmin ? 'Modo Administrador' : 'Modo Usuario'}
            </Label>
            <Switch
              id="admin-mode"
              checked={isAdmin}
              onCheckedChange={setIsAdmin}
            />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario o Correo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="usuario@ejemplo.com"
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

              <Link 
                to="/recuperar-contrasena" 
                className="text-sm text-accent hover:underline inline-block"
              >
                ¿Olvidaste tu contraseña?
              </Link>

              <Button 
                type="submit" 
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={form.formState.isSubmitting}
              >
                Iniciar Sesión
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">¿No tienes cuenta? </span>
            <Link to="/registro" className="text-accent hover:underline font-medium">
              Crear cuenta
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
