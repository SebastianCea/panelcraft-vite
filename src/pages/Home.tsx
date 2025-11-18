import { PublicHeader } from '@/components/public/PublicHeader';
import { ProductCard } from '@/components/public/ProductCard';
import { getFeaturedProducts } from '@/lib/productStorage';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Gamepad2, Zap, ShoppingBag } from 'lucide-react';

const Home = () => {
  const featuredProducts = getFeaturedProducts();

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-primary py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjE1LDAsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        <div className="container relative mx-auto px-4 text-center">
         
      <h1 className="fontFamily-roboto mb-4 text-4xl font-bold md:text-6xl text-accent flex items-center justify-center gap-4">
  <Gamepad2 className="h-16 w-16 text-accent animate-pulse" />
  Bienvenido a Level-Up⚡Gamer
</h1>
          <p className="mb-8 text-xl text-foreground/90 max-w-2xl mx-auto">
            Todo lo que necesitas para tu setup gamer al mejor precio
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/categorias">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Explorar Productos
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
              <a href="#featured">
                <Zap className="mr-2 h-5 w-5" />
                Ver Destacados
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Featured Products */}
      <section id="featured" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl text-accent">
              Productos Destacados
            </h2>
            <p className="text-lg text-muted-foreground">
              Los mejores productos para tu experiencia gaming
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/categorias">
                Ver Todas las Categorías
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center p-6 rounded-lg border border-border hover:border-accent/50 transition-colors">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-accent/10 p-4">
                  <ShoppingBag className="h-8 w-8 text-accent" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold">Envío Rápido</h3>
              <p className="text-muted-foreground">
                Recibe tus productos en tiempo récord
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border border-border hover:border-accent/50 transition-colors">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-accent/10 p-4">
                  <Zap className="h-8 w-8 text-accent" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold">Precios Competitivos</h3>
              <p className="text-muted-foreground">
                Los mejores precios del mercado
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border border-border hover:border-accent/50 transition-colors">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-accent/10 p-4">
                  <Gamepad2 className="h-8 w-8 text-accent" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold">Productos Originales</h3>
              <p className="text-muted-foreground">
                100% originales y garantizados
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2025 Level-Up⚡ Gamer. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
