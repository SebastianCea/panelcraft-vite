import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCartCount } from '@/lib/cartStorage';
import { cn } from '@/lib/utils';

export const PublicHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const updateCartCount = () => {
    setCartCount(getCartCount());
  };

  const navItems = [
    { path: '/home', label: 'Inicio' },
    { path: '/categorias', label: 'Categorías' },
    { path: '/carrito', label: 'Carrito' },
  ];

  const isActive = (path: string) => location.pathname === path;

    const neonStyle = {
      boxShadow: '0 0 5px #FFFF00, 0 0 10px #FFD700, 0 0 20px rgba(255, 255, 0, 0.3)',
      transition: 'box-shadow 0.3s ease-in-out',
  };


  return (
<nav 
        className="sticky top-0 z-50 border-b border-border bg-primary backdrop-blur supports-[backdrop-filter]:bg-primary/95 shadow-yellow-500/30"
        style={neonStyle} // 💡 APLICAMOS EL HALO AL NARBAR COMPLETO
    >      
    <div className="container mx-auto px-4 ">
        <div className="flex h-16 items-center justify-between shadow-yellow-500/30">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 text-2xl font-bold text-accent">
            <span>⚡</span>
            <span className="hidden sm:inline">Level-Up Gamer</span>
            <span className="sm:hidden">Level-Up</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-lg font-medium transition-colors hover:text-accent",
                  isActive(item.path) ? "text-accent" : "text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
            
            <Link to="/carrito">
              <Button variant="outline" size="icon" className="relative border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-accent text-accent-foreground">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <Link to="/login">
              <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                <LogIn className="h-5 w-5 mr-2" />
                Iniciar Sesión
              </Button>
            </Link>

            <Link to="/admin">
              <Button variant="ghost" size="icon" className="text-accent hover:text-accent hover:bg-accent/10">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link to="/carrito">
              <Button variant="outline" size="icon" className="relative border-accent text-accent">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-accent text-accent-foreground">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-accent hover:text-accent hover:bg-accent/10"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-4 py-2 text-lg font-medium rounded-lg transition-colors",
                  isActive(item.path)
                    ? "bg-accent/10 text-accent"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-lg font-medium text-accent hover:bg-accent/10 rounded-lg"
            >
              <LogIn className="h-5 w-5" />
              Iniciar Sesión
            </Link>
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-lg font-medium text-foreground hover:bg-muted rounded-lg"
            >
              <User className="h-5 w-5" />
              Panel Admin
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
