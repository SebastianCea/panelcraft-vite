import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// 💡 CORREGIDO: LogOut, LogIn, User ahora están bien nombrados si son íconos de lucide-react
import { Menu, X, ShoppingCart, User, LogIn, LogOut } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCartCount } from '@/lib/cartStorage';
import { getCurrentUser, hasAdminAccess, logout } from '@/lib/service/authenticateUser'; 
import { cn } from '@/lib/utils';

export const PublicHeader = () => {
 const [isOpen, setIsOpen] = useState(false);
 const [cartCount, setCartCount] = useState(0);
  // 🟢 Estado para el usuario y permisos
  const [user, setUser] = useState(getCurrentUser());
  const [canAccessAdmin, setCanAccessAdmin] = useState(hasAdminAccess());
  
 const location = useLocation();
  const navigate = useNavigate();
  
  const neonStyle = {
      boxShadow: '0 0 5px #FFFF00, 0 0 10px #FFD700, 0 0 20px rgba(255, 255, 0, 0.3)',
      transition: 'box-shadow 0.3s ease-in-out',
  };

 useEffect(() => {
  updateCartCount();
    
    // 🟢 Listener para actualizar la UI cuando se inicia/cierra sesión
    const handleAuthChange = () => {
        setUser(getCurrentUser());
        setCanAccessAdmin(hasAdminAccess());
    };

  window.addEventListener('storage', updateCartCount);
  window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('authChange', handleAuthChange); // Escuchar login/logout

  return () => {
   window.removeEventListener('storage', updateCartCount);
   window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('authChange', handleAuthChange);
  };
 }, []);

 const updateCartCount = () => {
  setCartCount(getCartCount());
 };
  
  // 💡 FUNCIÓN CORREGIDA
  const handleLogout = () => {
      logout();
      navigate('/login');
  };

 const navItems = [
  { path: '/home', label: 'Inicio' }, 
  { path: '/categorias', label: 'Categorías' },
  { path: '/carrito', label: 'Carrito' },
 ];

 const isActive = (path: string) => location.pathname === path;

 return (
  <nav className="sticky top-0 z-50 border-b border-border bg-primary backdrop-blur supports-[backdrop-filter]:bg-primary/95 shadow-yellow-500/30" style={neonStyle}>
   <div className="container mx-auto px-4 ">
    <div className="flex h-16 items-center justify-between">
     <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-accent"> 
      <span>⚡</span>
      <span className="hidden sm:inline">Level-Up Gamer</span>
      <span className="sm:hidden">Level-Up</span>
     </Link>

     {/* Desktop Navigation */}
     <div className="hidden md:flex items-center gap-6">
            {/* ... nav items mapping ... */}
      {navItems.map((item) => (
       <Link
        key={item.path}
        to={item.path}
        className={cn("text-lg font-medium transition-colors hover:text-accent", isActive(item.path) ? "text-accent" : "text-foreground")}
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

            {/* 🟢 LÓGICA DE BOTONES DE USUARIO 🟢 */}
            {user ? (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground hidden lg:inline">Hola, {user.name.split(' ')[0]}</span>
                    
                    {/* 💡 SOLO MOSTRAR EL BOTÓN ADMIN SI TIENE PERMISOS */}
                    {canAccessAdmin && (
                        <Link to="/admin" title="Panel de Administración">
                            <Button variant="ghost" size="icon" className="text-accent hover:text-accent hover:bg-accent/10">
                                <User className="h-5 w-5" />
                            </Button>
                        </Link>
                    )}
                    
                    {/* 💡 CORREGIDO: Nombre de función y componente */}
                    <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar Sesión">
                        <LogOut className="h-5 w-5 text-destructive" />
                    </Button>
                </div>
            ) : (
          <Link to="/login">
           <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
            <LogIn className="h-5 w-5 mr-2" />
            Iniciar Sesión
           </Button>
          </Link>
            )}
     </div>

     {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
             <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-accent">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
             </Button>
          </div>
    </div>
        
        {/* Mobile Nav Content - Puedes aplicar la misma lógica condicional aquí */}
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
                
                {/* Lógica Mobile: Mostrar botones basados en el estado de autenticación */}
                {user ? (
                    <>
                        {canAccessAdmin && (
                            <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-4 py-2 text-lg font-medium text-accent hover:bg-accent/10 rounded-lg">
                                <User className="h-5 w-5" /> Panel Admin
                            </Link>
                        )}
                        <button onClick={() => { handleLogout(); setIsOpen(false); }} className="flex w-full items-center gap-2 px-4 py-2 text-lg font-medium text-destructive hover:bg-destructive/10 rounded-lg">
                            <LogOut className="h-5 w-5" /> Cerrar Sesión
                        </button>
                    </>
                ) : (
                    <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-4 py-2 text-lg font-medium text-accent hover:bg-accent/10 rounded-lg">
                        <LogIn className="h-5 w-5" /> Iniciar Sesión
                    </Link>
                )}
            </div>
        )}
   </div>
  </nav>
 );
};