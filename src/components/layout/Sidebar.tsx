import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, Users, ShoppingCart, LogOut, Settings } from 'lucide-react';
import { logout } from '@/lib/service/authenticateUser';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new Event('authChange')); 
    window.dispatchEvent(new Event('storage'));
    navigate('/'); 
  };

  const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { title: 'Productos', icon: Package, path: '/admin?tab=products' },
    { title: 'Usuarios', icon: Users, path: '/admin?tab=users' },
    { title: 'Pedidos', icon: ShoppingCart, path: '/admin?tab=orders' },
  ];

  return (
    <div className={cn("pb-12 min-h-screen border-r bg-card h-full", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-accent flex items-center gap-2">
            <span>⚡</span> Panel Admin
          </h2>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant={location.search === item.path.split('?')[1] || (item.path === '/admin' && !location.search) ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link to={item.path}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        
        <div className="px-3 py-2 mt-auto">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Configuración
            </h2>
            <div className="space-y-1">
                 {/* 🟢 CORRECCIÓN: Ahora el botón Ajustes lleva al Perfil */}
                 <Button 
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                    asChild
                 >
                    <Link to="/perfil">
                        <Settings className="mr-2 h-4 w-4" />
                        Ajustes
                    </Link>
                 </Button>
                 
                 <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={handleLogout}
                 >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                 </Button>
            </div>
        </div>
      </div>
    </div>
  );
}