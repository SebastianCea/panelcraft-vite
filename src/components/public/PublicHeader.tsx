import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // 🟢 Importamos useNavigate
import { Menu, X, ShoppingCart, User, LogIn, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCartCount } from '@/lib/cartStorage';
import { getCurrentUser, hasAdminAccess, logout } from '@/lib/service/authenticateUser'; 
import { cn } from '@/lib/utils';

export const PublicHeader = () => {
 const [isOpen, setIsOpen] = useState(false);
 const [cartCount, setCartCount] = useState(0);
 const [user, setUser] = useState(getCurrentUser());
 const [canAccessAdmin, setCanAccessAdmin] = useState(hasAdminAccess());
  
 const location = useLocation();
 const navigate = useNavigate(); // 🟢 Hook para navegación
  
  const neonStyle = {
      boxShadow: '0 0 5px #FFFF00, 0 0 10px #FFD700, 0 0 20px rgba(255, 255, 0, 0.3)',
      transition: 'box-shadow 0.3s ease-in-out',
  };

 useEffect(() => {
  updateCartCount();
    const handleAuthChange = () => {
        setUser(getCurrentUser());
        setCanAccessAdmin(hasAdminAccess());
    };

  window.addEventListener('storage', updateCartCount);
  window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('authChange', handleAuthChange);

  return () => {
   window.removeEventListener('storage', updateCartCount);
   window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('authChange', handleAuthChange);
  };
 }, []);

 const updateCartCount = () => {
  setCartCount(getCartCount());
 };
  
  // 🟢 Función modificada para cerrar sesión y redirigir al Home
  const handleLogout = () => {
      logout();
      navigate('/'); // Redirige a la página principal (FrontPage)
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

            {/* BOTONES DE USUARIO */}
            {user ? (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground hidden lg:inline">Hola, {user.name.split(' ')[0]}</span>
                    
                    <Link to="/perfil" title="Mi Perfil">
                        <Button variant="ghost" size="icon" className="text-accent hover:text-accent hover:bg-accent/10">
                            <UserCircle className="h-5 w-5" />
                        </Button>
                    </Link>

                    {/* Botón Admin (Solo si corresponde) */}
                    {canAccessAdmin && (
                        <Link to="/admin" title="Panel de Administración">
                            <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                                <User className="h-5 w-5" />
                            </Button>
                        </Link>
                    )}
                    
                    {/* 🟢 Usamos handleLogout aquí */}
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
        
        {/* Mobile Nav Content */}
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
                
                {user ? (
                    <>
                        <Link to="/perfil" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-4 py-2 text-lg font-medium text-accent hover:bg-accent/10 rounded-lg">
                            <UserCircle className="h-5 w-5" /> Mi Perfil
                        </Link>

                        {canAccessAdmin && (
                            <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-4 py-2 text-lg font-medium text-red-400 hover:bg-red-400/10 rounded-lg">
                                <User className="h-5 w-5" /> Panel Admin
                            </Link>
                        )}
                        {/* 🟢 Usamos handleLogout aquí también */}
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