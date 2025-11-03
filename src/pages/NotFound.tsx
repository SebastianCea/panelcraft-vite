import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <AlertCircle className="h-24 w-24 text-accent" />
        </div>
        <h1 className="text-6xl font-bold text-accent">404</h1>
        <div className="space-y-2">
          <p className="text-2xl font-semibold text-foreground">Página no encontrada</p>
          <p className="text-muted-foreground max-w-md">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link to="/admin">
            <Home className="mr-2 h-4 w-4" />
            Volver al Panel
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
