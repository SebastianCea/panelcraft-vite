import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from '@/components/layout/Sidebar';
import { ProductTable } from '@/components/admin/ProductTable';
import { UserTable } from '@/components/admin/UserTable';
import { OrderTable } from '@/components/admin/OrderTable';
import { ProductFormModal } from '@/components/admin/ProductFormModal';
import { UserFormModal } from '@/components/admin/UserFormModal';
import { ProductViewModal } from '@/components/admin/ProductViewModal';
import { UserViewModal } from '@/components/admin/UserViewModal';
import { OrderDetailModal } from '@/components/admin/OrderDetailModal';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { getProducts, deleteProduct, addProduct, updateProduct } from '@/lib/productStorage';
import { getUsers, deleteUser, addUser, updateUser } from '@/lib/userStorage';
import { getOrders, calculateGrowthRate } from '@/lib/orderStorage';
import { getCurrentUser, hasAdminAccess, logout } from '@/lib/service/authenticateUser';
import { Product, ProductFormData } from '@/types/product';
import { User, UserFormData } from '@/types/user';
import { Order } from '@/types/order';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modales y estados de selección
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState<'product' | 'user' | null>(null);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const [isVendorDeletion, setIsVendorDeletion] = useState(false); // 🟢 Estado para saber si es vendedor

  const [growthRate, setGrowthRate] = useState({ percentage: 0, comparisonPeriod: '' });

  const navigate = useNavigate();
  const { toast } = useToast();
  
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.userType === 'Administrador';

  useEffect(() => {
    const checkAuthAndLoad = async () => {
        if (!hasAdminAccess()) {
            navigate('/login');
            return;
        }
        await loadAllData();
    };
    checkAuthAndLoad();
  }, [navigate]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
        const [loadedProducts, loadedOrders, growth] = await Promise.all([
            getProducts(),
            getOrders(),
            calculateGrowthRate()
        ]);
        
        setProducts(loadedProducts);
        setOrders(loadedOrders);
        setGrowthRate(growth);

        if (isAdmin) {
            const loadedUsers = await getUsers();
            setUsers(loadedUsers);
        }
    } catch (error) {
        console.error("Error cargando dashboard:", error);
        toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const handleSaveProduct = async (data: ProductFormData) => {
    try {
        if (editingProduct) {
            await updateProduct(editingProduct.id, data);
            toast({ title: "Producto actualizado" });
        } else {
            await addProduct(data);
            toast({ title: "Producto creado" });
        }
        setIsProductModalOpen(false);
        setEditingProduct(undefined);
        setProducts(await getProducts());
    } catch (error) {
        toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  const handleDeleteProductConfirm = async () => {
    if (itemToDeleteId) {
        await deleteProduct(itemToDeleteId);
        setProducts(await getProducts());
        toast({ title: "Producto eliminado" });
    }
    setDeleteConfirmOpen(false);
  };

  const handleSaveUser = async (data: UserFormData) => {
    try {
        if (editingUser) {
            await updateUser(editingUser.id, data);
            toast({ title: "Usuario actualizado" });
        } else {
            const newUserPayload = {
                ...data,
                passwordConfirm: data.password || "",
            };
            await addUser(newUserPayload);
            toast({ title: "Usuario creado" });
        }
        setIsUserModalOpen(false);
        setEditingUser(undefined);
        if (isAdmin) setUsers(await getUsers());
    } catch (error) {
        console.error(error);
        toast({ title: "Error al guardar usuario", description: "Verifica los datos.", variant: "destructive" });
    }
  };

  // 🟢 Confirmación de eliminación de usuario (modificado para recibir razón)
  const handleDeleteUserConfirm = async (reason?: string) => {
    if (itemToDeleteId) {
        const userToDelete = users.find(u => u.id === itemToDeleteId);
        
        if (userToDelete) {
            // Regla: No eliminar si tiene órdenes
            const hasOrders = orders.some(o => o.rutCliente === userToDelete.rut);
            if (hasOrders) {
                toast({ 
                    title: "No se puede eliminar", 
                    description: "Este usuario tiene órdenes asociadas.", 
                    variant: "destructive" 
                });
                setDeleteConfirmOpen(false);
                return;
            }

            // Regla: No eliminar otros admins
            if (userToDelete.userType === 'Administrador') {
                toast({ 
                    title: "Acción Prohibida", 
                    description: "No se permite eliminar cuentas de Administrador.", 
                    variant: "destructive" 
                });
                setDeleteConfirmOpen(false);
                return;
            }

            // 🟢 Regla: Si es vendedor, verificamos que tenga motivo
            if (userToDelete.userType === 'Vendedor' && !reason) {
                toast({ title: "Motivo requerido", variant: "destructive" });
                return; 
            }
        }

        await deleteUser(itemToDeleteId);
        if (isAdmin) setUsers(await getUsers());
        
        // Mensaje personalizado si se dio un motivo
        if (reason) {
            toast({ title: "Vendedor eliminado", description: `Motivo: ${reason}` });
        } else {
            toast({ title: "Usuario eliminado" });
        }
    }
    setDeleteConfirmOpen(false);
  };

  const openNewProductModal = () => {
      setEditingProduct(undefined);
      setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
      setEditingProduct(product);
      setIsProductModalOpen(true);
  };

  const openNewUserModal = () => {
      setEditingUser(undefined);
      setIsUserModalOpen(true);
  };

  const openEditUserModal = (user: User) => {
      setEditingUser(user);
      setIsUserModalOpen(true);
  };

  if (isLoading) {
      return <div className="h-screen w-full flex items-center justify-center bg-background text-foreground"><Loader2 className="h-10 w-10 animate-spin text-accent" /></div>;
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={currentUser?.userType}
        onLogout={() => { 
            logout(); 
            navigate('/login'); 
        }} 
      />
      
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-accent">Panel de Administración</h1>
            <div className="text-sm text-muted-foreground">Bienvenido, {currentUser?.name}</div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                    <span className="text-accent text-2xl font-bold">$</span>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        ${new Intl.NumberFormat('es-CL').format(orders.reduce((sum, o) => sum + o.finalTotal, 0))}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3 text-green-500" /> 
                        {Math.abs(growthRate.percentage * 100).toFixed(1)}% {growthRate.comparisonPeriod}
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{orders.length}</div>
                </CardContent>
            </Card>
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Productos</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{products.length}</div>
                </CardContent>
            </Card>
            
            {isAdmin && (
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                    </CardContent>
                </Card>
            )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsContent value="products" className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Inventario</h2>
                    <Button onClick={openNewProductModal} className="bg-accent text-accent-foreground hover:bg-accent/90">
                        Nuevo Producto
                    </Button>
                </div>
                <ProductTable 
                    products={products} 
                    isAdmin={isAdmin} 
                    onEdit={openEditProductModal}
                    onDelete={(id) => { 
                        setDeleteItemType('product'); 
                        setItemToDeleteId(id); 
                        setIsVendorDeletion(false); // Reset
                        setDeleteConfirmOpen(true); 
                    }}
                    onView={(p) => setSelectedProduct(p)}
                />
            </TabsContent>

            {isAdmin && (
                <TabsContent value="users" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Usuarios</h2>
                        <Button onClick={openNewUserModal} className="bg-accent text-accent-foreground hover:bg-accent/90">
                            Nuevo Usuario
                        </Button>
                    </div>
                    <UserTable 
                        users={users} 
                        onEdit={openEditUserModal}
                        onDelete={(id) => { 
                            setDeleteItemType('user'); 
                            setItemToDeleteId(id);
                            // 🟢 Detectamos si es vendedor para mostrar el selector
                            const userToDelete = users.find(u => u.id === id);
                            setIsVendorDeletion(userToDelete?.userType === 'Vendedor');
                            setDeleteConfirmOpen(true); 
                        }}
                        onView={(u) => setSelectedUser(u)}
                    />
                </TabsContent>
            )}

            <TabsContent value="orders" className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">Órdenes de Compra</h2>
                <OrderTable orders={orders} onView={(o) => setSelectedOrder(o)} />
            </TabsContent>
        </Tabs>

        {/* MODALES */}
        <ProductFormModal 
            isOpen={isProductModalOpen} 
            onClose={() => setIsProductModalOpen(false)} 
            onSubmit={handleSaveProduct} 
            initialData={editingProduct} 
        />
        <UserFormModal 
            isOpen={isUserModalOpen} 
            onClose={() => setIsUserModalOpen(false)} 
            onSubmit={handleSaveUser} 
            initialData={editingUser} 
        />
        <DeleteConfirmDialog 
            isOpen={deleteConfirmOpen} 
            onClose={() => setDeleteConfirmOpen(false)} 
            // 🟢 Pasamos isVendorDeletion al modal para activar el selector
            showReasonSelect={deleteItemType === 'user' && isVendorDeletion}
            onConfirm={async (reason) => {
                if (deleteItemType === 'product') {
                    await handleDeleteProductConfirm();
                } else {
                    await handleDeleteUserConfirm(reason);
                }
            }}
            title={`Eliminar ${deleteItemType === 'product' ? 'Producto' : 'Usuario'}`}
            description="Esta acción no se puede deshacer."
        />
        {selectedProduct && (
            <ProductViewModal 
                isOpen={!!selectedProduct} 
                onClose={() => setSelectedProduct(null)} 
                product={selectedProduct} 
            />
        )}
        {selectedUser && (
            <UserViewModal 
                isOpen={!!selectedUser} 
                onClose={() => setSelectedUser(null)} 
                user={selectedUser} 
            />
        )}
        {selectedOrder && (
            <OrderDetailModal 
                isOpen={!!selectedOrder} 
                onClose={() => setSelectedOrder(null)} 
                order={selectedOrder} 
            />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;