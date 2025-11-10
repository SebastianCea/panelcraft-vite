import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    console.log('Recuperar contraseña:', data.email);
    setSubmittedEmail(data.email);
    setSubmitted(true);
    toast({
      title: 'Código enviado',
      description: 'Revisa tu correo electrónico',
    });
    // Aquí se integrará con el backend de Spring Boot para enviar el código
  };

  const handleResend = () => {
    setSubmitted(false);
    form.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl text-accent">
            {submitted ? 'Código Enviado' : '¿Olvidaste tu contraseña?'}
          </CardTitle>
          <CardDescription>
            {submitted
              ? 'Hemos enviado un código de recuperación a tu correo'
              : 'Ingresa tu correo electrónico para recibir un código de recuperación'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!submitted ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="usuario@ejemplo.com"
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
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={form.formState.isSubmitting}
                >
                  Enviar Código
                </Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-foreground">
                  Revisa tu correo <strong className="text-accent">{submittedEmail}</strong>
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  El código expira en 15 minutos
                </p>
              </div>

              <Button 
                onClick={handleResend}
                variant="outline"
                className="w-full border-accent text-accent hover:bg-accent/10"
              >
                Enviar código nuevamente
              </Button>
            </div>
          )}

          <Link 
            to="/login" 
            className="flex items-center gap-2 text-sm text-accent hover:underline justify-center"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Iniciar Sesión
          </Link>
          
          {/* 💡 AÑADIDO: Enlace para volver a la página principal */}
          <div className="text-center text-sm mt-4">
            <Link to="/" className="text-muted-foreground hover:underline">
              ← Volver a la tienda
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
