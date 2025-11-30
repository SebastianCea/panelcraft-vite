import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 🟢 Importar useNavigate
import { User } from '@/types/user';
import { Product } from '@/types/product';
import { Order } from '@/types/order';

// Storages & Services
import { getUsers, addUser, updateUser, deleteUser } from '@/lib/userStorage';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/productStorage';
import { getOrders, calculateGrowthRate } from '@/lib/orderStorage';
import { initializeDemoData } from '@/lib/InitializeDemoData';
import { getCurrentUser } from '@/lib/service/authenticateUser';

// Components
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar'; 
import { UserTable } from '@/components/admin/UserTable';
import { UserFormModal } from '@/components/admin/UserFormModal';
import { UserViewModal } from '@/components/admin/UserViewModal';
import { ProductTable } from '@/components/admin/ProductTable';
import { ProductFormModal } from '@/components/admin/ProductFormModal';
import { ProductViewModal } from '@/components/admin/ProductViewModal';
import { OrderTable } from '@/components/admin/OrderTable';
import { OrderDetailModal } from '@/components/admin/OrderDetailModal';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Users as UsersIcon, Package, ShoppingCart, TrendingUp, Store } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate(); // 🟢 Hook de navegación
  
  // --- ESTADO DE USUARIO ACTUAL ---
  const [currentUser, setCurrentUser] = useState<User | null>(null); 
  const isSeller = currentUser?.userType === 'Vendedor'; 
  const isAdmin = currentUser?.userType === 'Administrador'; 

 // --- ESTADO DE USUARIOS ---
 const [users, setUsers] = useState<User[]>([]);
 const [selectedUser, setSelectedUser] = useState<User | null>(null);
 const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

 // --- ESTADO DE PRODUCTOS ---
 const [products, setProducts] = useState<Product[]>([]);
 const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
 const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null); 

 // --- ESTADO DE ÓRDENES ---
 const [orders, setOrders] = useState<Order[]>([]);
 const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); 

 // ESTADOS PARA CRECIMIENTO
  const [growthPercentage, setGrowthPercentage] = useState(0); 
  const [growthPeriod, setGrowthPeriod] = useState('vs mes anterior');
 
 // --- ESTADO DE UI Y MODALES ---
 const [activeSection, setActiveSection] = useState('home');
 const [sidebarOpen, setSidebarOpen] = useState(false);
 const [modalOpen, setModalOpen] = useState(false); 
 const [productModalOpen, setProductModalOpen] = useState(false); 
 const [viewModalOpen, setViewModalOpen] = useState(false); 
 const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
 

 const loadUsers = () => setUsers(getUsers());
 const loadProducts = () => setProducts(getProducts());
 const loadOrders = () => {
  const loadedOrders = getOrders();
  setOrders(loadedOrders); 
  const growthData = calculateGrowthRate();
  setGrowthPercentage(growthData.percentage);
  setGrowthPeriod(growthData.comparisonPeriod);
 };

 // --- LÓGICA DE CARGA Y AUTENTICACIÓN ---
 useEffect(() => {
  initializeDemoData(); 
  loadUsers(); 
  loadProducts(); 
  loadOrders();
    
    // Carga inicial
    const loggedUser = getCurrentUser();
    setCurrentUser(loggedUser);
    
    // Protección inicial de ruta
    if (loggedUser?.userType === 'Vendedor' && activeSection === 'users') {
        setActiveSection('home');
    }

    // 🟢 LISTENER DE CAMBIO DE AUTH (Para Logout remoto)
    const handleAuthChange = () => {
        const updatedUser = getCurrentUser();
        setCurrentUser(updatedUser);
        
        // Si no hay usuario (se cerró sesión en otra pestaña), expulsar
        if (!updatedUser) {
            navigate('/login');
            toast.info("Sesión cerrada desde otra ventana.");
        }
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
        window.removeEventListener('authChange', handleAuthChange);
    };

 }, [activeSection, navigate]); // Añadimos navigate a dependencias


  // --- 🟢 LÓGICA DE USUARIOS ---
  const handleEdit = (user: User) => { setSelectedUser(user); setModalOpen(true); };
  
  const handleDeleteUser = (id: string) => { 
      const u = users.find(x => x.id === id); 
      if (u) { 
          const userOrders = getOrders().filter(order => order.rutCliente === u.rut);
          
          if (userOrders.length > 0) {
              toast.error(`No se puede eliminar al usuario ${u.name} porque tiene ${userOrders.length} compra(s) registrada(s).`);
              return; 
          }

          setUserToDelete({ id, name: u.name }); 
          setDeleteDialogOpen(true); 
      }
  };

  const handleNewUser = () => { setSelectedUser(null); setModalOpen(true); };
  const handleCreateUser = (data: any) => { addUser(data); loadUsers(); setModalOpen(false); toast.success('Usuario creado'); };
  const handleUpdateUser = (data: any) => { if(selectedUser) { updateUser(selectedUser.id, data); loadUsers(); setModalOpen(false); } };
  
  const handleView = (user: User) => { setSelectedUser(user); setViewModalOpen(true); }; 


  // --- 🟢 LÓGICA DE PRODUCTOS ---
  const handleNewProduct = () => { 
      if (isAdmin) {
          setSelectedProduct(null); 
          setProductModalOpen(true); 
      } else {
          toast.error("Permiso denegado. Solo los administradores pueden crear productos.");
      }
  };
  
  const handleEditProduct = (product: Product) => { 
      if (isAdmin) {
          setSelectedProduct(product); 
          setProductModalOpen(true); 
      } else {
          toast.error("Permiso denegado. Solo los administradores pueden editar productos.");
      }
  };
  
  const handleViewProduct = (product: Product) => { setSelectedProduct(product); setViewModalOpen(true); }; 
  
  const handleDeleteProduct = (id: string) => { 
      if (isAdmin) {
          const p = products.find(x=>x.id===id); 
          if(p) { setProductToDelete({id, name:p.name}); setDeleteDialogOpen(true); }
      } else {
          toast.error("Permiso denegado. Solo los administradores pueden eliminar productos.");
      }
  };
  
  const handleSubmitProduct = (data: any) => { 
      if (isAdmin) {
          if(selectedProduct) updateProduct(selectedProduct.id, data); 
          else addProduct(data); 
          loadProducts(); 
          setProductModalOpen(false); 
          toast.success('Producto guardado'); 
      } else {
          toast.error("Permiso denegado. Solo los administradores pueden crear/editar productos.");
      }
  };

  // --- Lógica de Órdenes y Delete Confirm ---
  const handleViewOrderDetails = (order: Order) => { setSelectedOrder(order); setViewModalOpen(true); };
  
  const confirmDelete = () => {
      if (userToDelete) { 
          deleteUser(userToDelete.id); 
          loadUsers(); 
          toast.success('Usuario eliminado correctamente'); 
      }
      else if (productToDelete) { 
          deleteProduct(productToDelete.id); 
          loadProducts(); 
          toast.success('Producto eliminado correctamente'); 
      }
      setDeleteDialogOpen(false); 
      setUserToDelete(null); 
      setProductToDelete(null);
  };


 // --- RENDERIZADO DE SECCIONES ---
 const renderContent = () => {
  switch (activeSection) {
   case 'home':
        return (
     <div className="space-y-8">
            {/* Header de Bienvenida Personalizado */}
      <div>
       <h1 className="mb-2 text-4xl font-bold text-accent">
        Bienvenido {currentUser?.name || 'Administrador'}
       </h1>
              <div className="flex items-center gap-2 text-xl text-muted-foreground">
                <span>Panel de control Level-Up</span>
                <span className="px-2 py-0.5 rounded-full bg-yellow-300 text-yellow-800 text-sm border border-yellow-400">
                    {currentUser?.userType}
                </span>
              </div>
      </div>

            {/* CARD REPORTS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Total Usuarios (Solo Admin) */}
              {!isSeller && (
       <Card className="border-border bg-card hover:border-accent/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
         <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
         <UsersIcon className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
         <div className="text-2xl font-bold text-accent">{users.length}</div>
         <p className="text-xs text-muted-foreground">Usuarios registrados</p>
        </CardContent>
       </Card>
              )}

              {/* Productos */}
       <Card className="border-border bg-card hover:border-accent/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
         <CardTitle className="text-sm font-medium">Productos</CardTitle>
         <Package className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
         <div className="text-2xl font-bold text-accent">{products.length}</div> 
         <p className="text-xs text-muted-foreground">Productos en inventario</p>
        </CardContent>
       </Card>

              {/* Reporte / Crecimiento */}
       <Card className="border-border bg-card hover:border-accent/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Crecimiento</CardTitle>
          <TrendingUp className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">
            {`${growthPercentage > 0 ? '+' : ''}${
             (growthPercentage * 100).toFixed(1)
           }%`}
          </div>
          <p className="text-xs text-muted-foreground">{growthPeriod}</p>
        </CardContent>
       </Card>

              {/* Órdenes */}
       <Card className="border-border bg-card hover:border-accent/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
         <CardTitle className="text-sm font-medium">Órdenes</CardTitle>
         <ShoppingCart className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
         <div className="text-2xl font-bold text-accent">{orders.length}</div>
         <p className="text-xs text-muted-foreground">Total de transacciones</p>
        </CardContent>
       </Card>

      </div>

            {/* Acceso Rápido */}
      <Card className="border-border bg-card">
       <CardHeader>
        <CardTitle className="text-accent">Acceso Rápido</CardTitle>
                <CardDescription>Accede a las funciones principales</CardDescription>
       </CardHeader>
       <CardContent className="flex flex-wrap gap-4">
                {!isSeller && (
        <Button
         onClick={() => setActiveSection('users')}
         className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
         <UsersIcon className="mr-2 h-4 w-4" />
         Gestionar Usuarios
        </Button>
                )}
        <Button 
         onClick={() => setActiveSection('products')}
         className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
         <Package className="mr-2 h-4 w-4" />
         Gestionar Productos
        </Button>

                <Button 
                    onClick={() => setActiveSection('orders')}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Ver Órdenes
                </Button>

                <Button 
                    onClick={() => window.location.href = '/home'} 
                    variant="outline" 
                >
                    <Store className="mr-2 h-4 w-4" />
                    Ir A Tienda
                </Button>

       </CardContent>
      </Card>
     </div>
    );

   case 'users':
        if (isSeller) return null;
    return (
     <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
       <div>
        <h1 className="mb-2 text-4xl font-bold text-accent">Gestión de Usuarios</h1>
        <p className="text-lg text-muted-foreground">Administra y visualiza todos los usuarios</p>
       </div>
       <Button
        onClick={handleNewUser}
        className="bg-accent text-accent-foreground hover:bg-accent/90"
       >
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Usuario
       </Button>
       </div>
      <UserTable users={users} onEdit={handleEdit} onDelete={handleDeleteUser} onView={handleView} />
     </div>
    );

   case 'products':
    return (
     <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
       <div>
        <h1 className="mb-2 text-4xl font-bold text-accent">Gestión de Productos</h1>
        <p className="text-lg text-muted-foreground">Administra y visualiza todos los productos</p>
       </div>
              
              {!isSeller && (
       <Button
        onClick={handleNewProduct}
        className="bg-accent text-accent-foreground hover:bg-accent/90"
       >
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Producto
       </Button>
              )}

       </div>
      <ProductTable products={products} onEdit={handleEditProduct} onDelete={handleDeleteProduct} onView={handleViewProduct} isAdmin={isAdmin} />
     </div>
    );

      case 'orders':
        return (
            <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
             <div>
              <h1 className="mb-2 text-4xl font-bold text-yellow-400">Gestión de Órdenes</h1>
              <p className="text-lg text-muted-foreground">Administra y visualiza todas las órdenes.</p>
             </div>
            </div>
            <OrderTable orders={orders} onViewDetails={handleViewOrderDetails} />
           </div>
        );

   default:
    return null;
  }
 };

 return (
  <div className="min-h-screen bg-background">
   <Sidebar
    activeSection={activeSection}
    onSectionChange={setActiveSection}
    isOpen={sidebarOpen}
    onClose={() => setSidebarOpen(false)}
        currentUser={currentUser} 
   />

   <div className="lg:pl-64">
    <Header onMenuClick={() => setSidebarOpen(true)} />
    <main className="p-6">{renderContent()}</main>
   </div>

   {isAdmin && (
          <>
          <UserFormModal
            isOpen={modalOpen}
            onClose={() => { setModalOpen(false); setSelectedUser(null); }}
            user={selectedUser}
            onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
          />
          {activeSection === 'products' && (
            <ProductFormModal
              isOpen={productModalOpen}
              onClose={() => { setProductModalOpen(false); setSelectedProduct(null); }}
              product={selectedProduct}
              onSubmit={handleSubmitProduct}
            />
          )}
          <UserViewModal
            isOpen={viewModalOpen && activeSection === 'users' && !!selectedUser} 
            onClose={() => { setViewModalOpen(false); setSelectedUser(null); }}
            user={selectedUser}
          />
          </>
      )}

      {activeSection === 'products' && (
          <ProductViewModal
            isOpen={viewModalOpen && !!selectedProduct}
            onClose={() => { setViewModalOpen(false); setSelectedProduct(null); }}
            product={selectedProduct}
          />
      )}

      <OrderDetailModal
        isOpen={viewModalOpen && activeSection === 'orders'}
        onClose={() => { setViewModalOpen(false); setSelectedOrder(null); }}
        order={selectedOrder}
      />
      
   <DeleteConfirmDialog
    isOpen={deleteDialogOpen}
    onClose={() => { setDeleteDialogOpen(false); setUserToDelete(null); setProductToDelete(null); }}
    onConfirm={confirmDelete}
    itemName={userToDelete?.name || productToDelete?.name || ''} 
   />
  </div>
 );
};

export default AdminDashboard;