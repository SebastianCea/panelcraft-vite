import { Home, Users, Package, ShoppingCart, X, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'products', label: 'Productos', icon: Package },
  { id: 'orders', label: 'Órdenes', icon: ShoppingCart },
  { id: 'store', label: 'Ir A Tienda', icon: Store, isExternalLink: true },
];

export const Sidebar = ({ activeSection, onSectionChange, isOpen, onClose }: SidebarProps) => {
  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 border-r border-border bg-sidebar-background transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <h2 className="text-xl font-bold text-sidebar-primary-foreground">LEVEL-UP</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground hover:text-sidebar-primary-foreground"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
 <nav className="space-y-2 p-4">
     {menuItems.map((item) => {
      const Icon = item.icon;
      const isActive = activeSection === item.id;
      
      // 💡 CAMBIO 2: Lógica del Click
      const handleClick = () => {
       if (item.id === 'store') {
        // REDIRECCIÓN: Navega a la raíz del sitio (el home de la tienda)
        window.location.href = '/'; 
       } else {
        // Comportamiento normal (cambiar sección del admin)
        onSectionChange(item.id);
       }
       onClose(); // Cierra el sidebar después de la acción
      };

      return (
       <button
        key={item.id}
        onClick={handleClick} // Usamos la nueva función
        className={cn(
         "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium transition-all",
         //CAMBIO 3: Estilo condicional para el botón de la tienda
         item.id === 'store' 
          ? "border-2 border-accent text-accent hover:bg-accent/20"
          : (isActive
           ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-md"
           : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          )
        )}
       >
        <Icon className="h-5 w-5" />
        <span className="text-lg">{item.label}</span>
       </button>
      );
     })}
    </nav>
      </aside>
    </>
  );
};
