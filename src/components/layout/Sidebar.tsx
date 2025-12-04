import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Users, LogOut, Store } from "lucide-react"; 
import { Link, useNavigate } from "react-router-dom"; // 🟢 Importamos useNavigate

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userRole?: string; 
}

export function Sidebar({ className, activeTab, setActiveTab, onLogout, userRole }: SidebarProps) {
  const navigate = useNavigate(); // 🟢 Hook para navegación

  const handleLogout = () => {
      onLogout(); // Ejecuta la lógica de limpieza de sesión (que viene del padre)
      navigate('/'); // 🟢 Redirige al Home (FrontPage) en lugar de login
  };

  return (
    <div className={cn("pb-12 w-64 border-r bg-card hidden md:block", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Administración
          </h2>
          <div className="space-y-1">
            <Button 
                variant={activeTab === "products" ? "secondary" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab("products")}
            >
              <Package className="mr-2 h-4 w-4" />
              Inventario
            </Button>
            
            {userRole === 'Administrador' && (
                <Button 
                    variant={activeTab === "users" ? "secondary" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("users")}
                >
                <Users className="mr-2 h-4 w-4" />
                Usuarios
                </Button>
            )}

            <Button 
                variant={activeTab === "orders" ? "secondary" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab("orders")}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Órdenes
            </Button>
          </div>
        </div>

        <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Navegación
            </h2>
            <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to="/home">
                        <Store className="mr-2 h-4 w-4" />
                        Ir a la Tienda
                    </Link>
                </Button>
            </div>
        </div>

        <div className="px-3 py-2 mt-auto">
            <div className="space-y-1">
                {/* 🟢 Usamos handleLogout aquí */}
                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100/10" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}