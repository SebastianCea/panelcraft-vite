import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PublicHeader } from "@/components/public/PublicHeader";
import { ProductCard } from "@/components/public/ProductCard";
import { Button } from "@/components/ui/button";
import { getFeaturedProducts } from "@/lib/productStorage";
import { getCurrentUser } from "@/lib/service/authenticateUser"; 
import { Product } from "@/types/product";
import { User } from "@/types/user"; 
import { ArrowRight, Gamepad2, Laptop, Tv } from "lucide-react";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null); 

  useEffect(() => {
    // 1. Cargar productos destacados
    const loadData = async () => {
      try {
        const products = await getFeaturedProducts();
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error cargando destacados:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();

    // 2. Verificar usuario actual al cargar
    const user = getCurrentUser();
    setCurrentUser(user);

    // Escuchar cambios de sesión (login/logout) para actualizar la vista en tiempo real
    const handleAuthChange = () => {
        setCurrentUser(getCurrentUser());
    };
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);

  }, []);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="relative bg-secondary py-20 md:py-32 overflow-hidden">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-accent">
                  Sube de Nivel tu Setup
                </h1>
                <p className="max-w-[600px] text-gray-300 md:text-xl">
                  Encuentra las mejores consolas, accesorios y componentes para llevar tu experiencia de juego al siguiente nivel.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to="/categorias">Ver Catálogo</Link>
                </Button>
                
                {/* LÓGICA: Solo mostrar "Crear Cuenta" si NO hay usuario logueado */}
                {!currentUser && (
                    <Button asChild variant="outline" size="lg" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                    <Link to="/registro">Crear Cuenta</Link>
                    </Button>
                )}
              </div>
            </div>
            <div className="mx-auto lg:ml-auto flex justify-center">
                <div className="relative w-full max-w-[500px] aspect-square bg-gradient-to-tr from-accent/20 to-purple-500/20 rounded-full animate-pulse blur-3xl absolute" />
                {/* 🟢 IMAGEN ACTUALIZADA: Usamos el icono de levelup */}
                <img 
                    src="/img/icono_levelup.PNG" 
                    alt="Level Up Gamer"
                    className="relative z-10 w-full max-w-[400px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-16 bg-card/50">
        <div className="container px-4 md:px-6">
            <h2 className="text-2xl font-bold text-center mb-10 text-foreground">Categorías Populares</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/categorias?cat=consolas" className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 hover:border-accent transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                            <Gamepad2 className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Consolas</h3>
                            <p className="text-sm text-muted-foreground">PS5, Xbox, Switch</p>
                        </div>
                    </div>
                </Link>
                <Link to="/categorias?cat=computadores" className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 hover:border-accent transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                            <Laptop className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Computación</h3>
                            <p className="text-sm text-muted-foreground">Notebooks, PC Gamer</p>
                        </div>
                    </div>
                </Link>
                <Link to="/categorias?cat=accesorios" className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 hover:border-accent transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                            <Tv className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Accesorios</h3>
                            <p className="text-sm text-muted-foreground">Monitores, Periféricos</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-accent">Destacados</h2>
            <Link to="/categorias" className="flex items-center text-muted-foreground hover:text-accent transition-colors">
              Ver todos <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">Cargando productos destacados...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-10 border border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground">No hay productos destacados por el momento.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border bg-card">
        <div className="container px-4 text-center">
            <p className="text-muted-foreground">© 2025 Level-Up⚡ Gamer. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;