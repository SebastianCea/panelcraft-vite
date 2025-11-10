import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Recuperar contraseña:', email);
    setSubmitted(true);
    // Aquí se integrará con el backend de Spring Boot para enviar el código
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input border-border"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Enviar Código
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-foreground">
                  Revisa tu correo <strong className="text-accent">{email}</strong>
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  El código expira en 15 minutos
                </p>
              </div>

              <Button 
                onClick={() => setSubmitted(false)}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
