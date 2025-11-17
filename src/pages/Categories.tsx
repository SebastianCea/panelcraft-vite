import { useState, useEffect } from 'react'; // 💡 Importar useEffectimport { PublicHeader } from '@/components/public/PublicHeader';
import { Product } from '@/types/product'; // 💡 Importar el tipo Product
import { ProductCard } from '@/components/public/ProductCard';
import { getProducts } from '@/lib/productStorage';
//import { demoProductsList } from '@/lib/productsData';
import { Button } from '@/components/ui/button';
import { Gamepad2, Monitor, Headphones, Dice5, Shirt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PublicHeader } from '@/components/public/PublicHeader';

const categories = [
  { id: 'all', name: 'Todos', icon: Gamepad2 },
  { id: 'consolas', name: 'Consolas', icon: Gamepad2 },
  { id: 'computadores', name: 'Computadores', icon: Monitor },
  { id: 'accesorios', name: 'Accesorios', icon: Headphones },
  { id: 'juegos-mesa', name: 'Juegos de Mesa', icon: Dice5 },
  { id: 'ropa', name: 'Ropa', icon: Shirt },
];

const Categories = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // 💡 NUEVO EFECTO: Cargar los productos al iniciar el componente
  useEffect(() => {
 // 🟢 Llama a la función que lee desde localStorage
 setAllProducts(getProducts()); 
   }, []);

  const filteredProducts =
  activeCategory === 'all'
   ? allProducts // 🟢 AHORA USA EL ESTADO REAL
   : allProducts.filter((p) => p.category.toLowerCase() === activeCategory);


   
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold text-accent">Explorar Categorías</h1>
          <p className="text-lg text-muted-foreground">
            Encuentra todo lo que necesitas para tu setup gamer
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <Button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                variant={isActive ? 'default' : 'outline'}
                className={cn(
                  isActive
                    ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                    : 'border-border hover:border-accent hover:text-accent'
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Mostrando {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <Gamepad2 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">
              No hay productos en esta categoría
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2025 Level-Up⚡ Gamer. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Categories;
