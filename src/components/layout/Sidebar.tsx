import { cn } from '@/lib/utils';
import { Home, Users, Package, ShoppingCart, Store, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../lib/service/authenticateUser'; 
import { User } from '@/types/user';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null; 
}

export const Sidebar = ({ activeSection, onSectionChange, isOpen, onClose, currentUser }: SidebarProps) => {
  const navigate = useNavigate();
  const isSeller = currentUser?.userType === 'Vendedor'; 

  const handleLogout = () => {
      logout();
      navigate('/login');
  };

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    // 💡 RESTRICCIÓN ROL: OCULTAR SI ES VENDEDOR
    ...(!isSeller ? [{ id: 'users', label: 'Usuarios', icon: Users }] : []),
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'orders', label: 'Órdenes', icon: ShoppingCart },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-transform duration-200 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <span className="text-2xl font-bold text-accent">⚡ LEVEL-UP</span>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
             <span className="sr-only">Cerrar</span>
          </Button>
        </div>

        <div className="flex flex-col h-[calc(100%-4rem)] justify-between p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    onClose();
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    activeSection === item.id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/10 hover:text-accent"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Botón Ir a Tienda siempre en la parte inferior */}
          <div className="space-y-2">
            <Link to="/">
                <Button variant="outline" className="w-full justify-start gap-3 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                    <Store className="h-5 w-5" />
                    Ir A Tienda
                </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};