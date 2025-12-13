import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { ProductTable } from '@/components/admin/ProductTable';
import { UserTable } from '@/components/admin/UserTable';
import { OrderTable } from '@/components/admin/OrderTable';
import { Button } from '@/components/ui/button';
import { Plus, LayoutDashboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Data & Services
import { getProducts, deleteProduct, addProduct, updateProduct, updateStock } from '@/lib/productStorage';
import { getUsers, deleteUser, addUser, updateUser } from '@/lib/userStorage';
import { getOrders, updateOrder } from '@/lib/orderStorage';
import { Product, ProductFormData } from '@/types/product';
import { User, UserFormData } from '@/types/user';
import { Order } from '@/types/order';
import { getCurrentUser, hasAdminAccess } from '@/lib/service/authenticateUser';

// Modals
import { ProductFormModal } from '@/components/admin/ProductFormModal';
import { ProductViewModal } from '@/components/admin/ProductViewModal';
import { UserFormModal } from '@/components/admin/UserFormModal';
import { UserViewModal } from '@/components/admin/UserViewModal';
import { OrderDetailModal } from '@/components/admin/OrderDetailModal';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('products');

  // Estados de datos
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // 🟢 VIGILANTE DE SEGURIDAD (Protección en tiempo real)
  useEffect(() => {
    const checkAccess = () => {
        const user = getCurrentUser();
        const isAdmin = hasAdminAccess();

        // Si no hay usuario o no es admin, ¡fuera!
        if (!user || !isAdmin) {
            navigate('/'); // Redirige al home
        }
    };

    // 1. Verificar al cargar
    checkAccess();

    // 2. Escuchar cambios en otras pestañas (evento 'storage')
    window.addEventListener('storage', checkAccess);
    
    // 3. Escuchar cambios en la misma pestaña (evento custom 'authChange')
    window.addEventListener('authChange', checkAccess);

    return () => {
        window.removeEventListener('storage', checkAccess);
        window.removeEventListener('authChange', checkAccess);
    };
  }, [navigate]);

  // Manejo de Tabs desde URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
        setActiveTab(tab);
    } else {
        // Default a productos si no hay tab, o dashboard
        setActiveTab('products');
    }
  }, [location]);

  // Cargar datos (CORREGIDO: Ahora es async para manejar Promesas)
  const loadData = async () => {
    try {
        // Asumiendo que getProducts, getUsers y getOrders pueden devolver promesas o valores directos
        // Usamos Promise.resolve por si acaso son síncronos, o await si son asíncronos.
        const productsData = await Promise.resolve(getProducts());
        const usersData = await Promise.resolve(getUsers());
        const ordersData = await Promise.resolve(getOrders());

        // Verificamos si son arrays antes de setear (por si acaso devuelven null/undefined)
        if (Array.isArray(productsData)) setProducts(productsData);
        if (Array.isArray(usersData)) setUsers(usersData);
        if (Array.isArray(ordersData)) setOrders(ordersData);
    } catch (error) {
        console.error("Error cargando datos:", error);
        toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" });
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData); // Sincronizar datos entre tabs
    return () => window.removeEventListener('storage', loadData);
  }, []);

  // --- LÓGICA DE MODALES (Productos) ---
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isProductViewOpen, setIsProductViewOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [viewingProduct, setViewingProduct] = useState<Product | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'product' | 'user' | null>(null);

  const handleCreateProduct = async (data: ProductFormData) => {
    await Promise.resolve(addProduct(data));
    loadData();
    setIsProductModalOpen(false);
    toast({ title: "Producto creado", description: "El producto se ha agregado correctamente." });
  };

  const handleUpdateProduct = async (data: ProductFormData) => {
    if (editingProduct) {
      await Promise.resolve(updateProduct(editingProduct.id, data));
      loadData();
      setEditingProduct(undefined);
      setIsProductModalOpen(false);
      toast({ title: "Producto actualizado", description: "Los cambios se han guardado." });
    }
  };

  // --- LÓGICA DE MODALES (Usuarios) ---
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isUserViewOpen, setIsUserViewOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [viewingUser, setViewingUser] = useState<User | undefined>(undefined);

  const handleCreateUser = async (data: UserFormData) => {
    try {
        await Promise.resolve(addUser(data));
        loadData();
        setIsUserModalOpen(false);
        toast({ title: "Usuario creado", description: "El usuario ha sido registrado." });
    } catch (e) {
        toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    }
  };

  const handleUpdateUser = async (data: UserFormData) => {
    if (editingUser) {
        await Promise.resolve(updateUser(editingUser.id, data));
        loadData();
        setEditingUser(undefined);
        setIsUserModalOpen(false);
        toast({ title: "Usuario actualizado", description: "Datos guardados correctamente." });
    }
  };

  // --- LÓGICA DE PEDIDOS ---
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const handleUpdateOrderStatus = async (orderId: string, status: Order['statePedido']) => {
    // Si updateOrder no existe en orderStorage, necesitas crearla.
    if (typeof updateOrder === 'function') {
        await Promise.resolve(updateOrder(orderId, { statePedido: status }));
        loadData();
        toast({ title: "Estado actualizado", description: `La orden #${orderId.slice(0,6)} está ahora: ${status}` });
    } else {
        console.error("updateOrder no está implementado o importado correctamente.");
        toast({ title: "Error", description: "Función de actualizar orden no disponible.", variant: "destructive" });
    }
  };

  // --- ELIMINACIÓN GENÉRICA ---
  const confirmDelete = async () => {
    if (deleteType === 'product' && deletingId) {
        await Promise.resolve(deleteProduct(deletingId));
        toast({ title: "Producto eliminado", variant: "destructive" });
    } else if (deleteType === 'user' && deletingId) {
        const deleted = await Promise.resolve(deleteUser(deletingId));
        if (deleted) toast({ title: "Usuario eliminado", variant: "destructive" });
        else toast({ title: "Error", description: "No se puede eliminar el último admin", variant: "destructive" });
    }
    setDeletingId(null);
    setDeleteType(null);
    loadData();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar className="w-64 hidden md:block fixed h-full" />
      
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto min-h-screen">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-accent capitalize">
                    {activeTab === 'dashboard' ? 'Panel General' : 
                     activeTab === 'products' ? 'Gestión de Productos' : 
                     activeTab === 'users' ? 'Gestión de Usuarios' : 'Pedidos'}
                </h1>
                <p className="text-muted-foreground mt-1">Administra tu tienda desde aquí.</p>
            </div>
            
            {activeTab === 'products' && (
                <Button onClick={() => { setEditingProduct(undefined); setIsProductModalOpen(true); }} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
                </Button>
            )}
            {activeTab === 'users' && (
                <Button onClick={() => { setEditingUser(undefined); setIsUserModalOpen(true); }} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
                </Button>
            )}
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm">
            {activeTab === 'products' && (
                <ProductTable 
                    products={products} 
                    onEdit={(p) => { setEditingProduct(p); setIsProductModalOpen(true); }}
                    onDelete={(id) => { setDeletingId(id); setDeleteType('product'); }}
                    onView={(p) => { setViewingProduct(p); setIsProductViewOpen(true); }}
                    isAdmin={true}
                />
            )}

            {activeTab === 'users' && (
                <UserTable 
                    users={users}
                    onEdit={(u) => { setEditingUser(u); setIsUserModalOpen(true); }}
                    onDelete={(id) => { setDeletingId(id); setDeleteType('user'); }}
                    onView={(u) => { setViewingUser(u); setIsUserViewOpen(true); }}
                />
            )}

            {activeTab === 'orders' && (
                <OrderTable 
                    orders={orders}
                    onView={(o) => setViewingOrder(o)}
                    onUpdateStatus={handleUpdateOrderStatus}
                />
            )}

            {activeTab === 'dashboard' && (
                <div className="p-8 text-center text-muted-foreground">
                    <LayoutDashboard className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>Bienvenido al Dashboard. Selecciona una opción del menú lateral.</p>
                </div>
            )}
        </div>
      </main>

      {/* --- MODALES --- */}
      
      {/* Productos */}
      <ProductFormModal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} 
        initialData={editingProduct} 
      />
      <ProductViewModal 
        isOpen={isProductViewOpen} 
        onClose={() => setIsProductViewOpen(false)} 
        product={viewingProduct} 
      />

      {/* Usuarios */}
      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        initialData={editingUser}
      />
      <UserViewModal
        isOpen={isUserViewOpen}
        onClose={() => setIsUserViewOpen(false)}
        user={viewingUser}
      />

      {/* Pedidos */}
      <OrderDetailModal
        isOpen={!!viewingOrder}
        onClose={() => setViewingOrder(null)}
        order={viewingOrder}
      />

      {/* Confirmación Borrar */}
      <DeleteConfirmDialog 
        isOpen={!!deletingId} 
        onClose={() => setDeletingId(null)} 
        onConfirm={confirmDelete} 
        title={deleteType === 'product' ? 'Eliminar Producto' : 'Eliminar Usuario'}
        description="Esta acción no se puede deshacer."
      />

    </div>
  );
};

export default AdminDashboard;