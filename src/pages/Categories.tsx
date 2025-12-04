import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PublicHeader } from '@/components/public/PublicHeader';
import { ProductCard } from '@/components/public/ProductCard';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/productStorage';
import { Product } from '@/types/product';
import { Gamepad2, Laptop, Tv, Package, Shirt, Dice5 } from 'lucide-react';

const Categories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('cat') || 'todos';
  
  // 🟢 1. Estado para productos y carga
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🟢 2. Cargar productos al montar
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const data = await getProducts();
        setAllProducts(data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  const categories = [
    { id: 'todos', label: 'Todo', icon: Package },
    { id: 'consolas', label: 'Consolas', icon: Gamepad2 },
    { id: 'computadores', label: 'Computación', icon: Laptop },
    { id: 'accesorios', label: 'Accesorios', icon: Tv },
    { id: 'juegos-mesa', label: 'Juegos de Mesa', icon: Dice5 },
    { id: 'ropa', label: 'Ropa', icon: Shirt },
  ];

  const filteredProducts = currentCategory === 'todos' 
    ? allProducts 
    : allProducts.filter(p => p.category === currentCategory);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-accent">Explorar Categorías</h1>
        
        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-10 overflow-x-auto pb-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = currentCategory === cat.id;
            return (
              <Button
                key={cat.id}
                variant={isActive ? "default" : "outline"}
                className={`flex items-center gap-2 ${isActive ? "bg-accent text-accent-foreground" : "border-border text-foreground hover:text-accent hover:border-accent"}`}
                onClick={() => setSearchParams({ cat: cat.id })}
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* 🟢 3. Renderizado Condicional */}
        {isLoading ? (
            <div className="text-center py-20 text-muted-foreground animate-pulse">
                Cargando catálogo...
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
                ))
            ) : (
                <div className="col-span-full text-center py-20 border border-dashed border-border rounded-lg">
                    <p className="text-xl text-muted-foreground">No se encontraron productos en esta categoría.</p>
                    <Button 
                        variant="link" 
                        onClick={() => setSearchParams({ cat: 'todos' })}
                        className="text-accent mt-2"
                    >
                        Ver todos los productos
                    </Button>
                </div>
            )}
            </div>
        )}
      </div>
    </div>
  );
};

export default Categories;