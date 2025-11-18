import { useState, useEffect } from 'react';
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
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog'; // Corregido: asumimos que DeleteConfirmDialog usa el alias @/components/ui
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Users as UsersIcon, Package, ShoppingCart, TrendingUp, Store } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
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
 const [viewModalOpen, setViewModalOpen] = useState(false); // Modal de vista general
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

 // --- LÓGICA DE CARGA DE DATOS ---
 useEffect(() => {
  initializeDemoData(); 
  loadUsers(); 
  loadProducts(); 
  loadOrders();
    
    // Cargar usuario actual al montar
    const loggedUser = getCurrentUser();
    setCurrentUser(loggedUser);
    
    // Si entra un vendedor y está en la sección users, lo mandamos a home (seguridad extra)
    if (loggedUser?.userType === 'Vendedor' && activeSection === 'users') {
        setActiveSection('home');
    }
 }, [activeSection]);


  // --- 🟢 LÓGICA DE USUARIOS ---
  const handleEdit = (user: User) => { setSelectedUser(user); setModalOpen(true); };
  const handleDeleteUser = (id: string) => { const u = users.find(x=>x.id===id); if(u) { setUserToDelete({id, name:u.name}); setDeleteDialogOpen(true); }};
  const handleNewUser = () => { setSelectedUser(null); setModalOpen(true); };
  const handleCreateUser = (data: any) => { addUser(data); loadUsers(); setModalOpen(false); toast.success('Usuario creado'); };
  const handleUpdateUser = (data: any) => { if(selectedUser) { updateUser(selectedUser.id, data); loadUsers(); setModalOpen(false); } };
  
  // 💡 FIX: Reactivamos la vista para el Administrador (ya que es el único que ve la tabla)
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
  
  // 💡 FIX: Reactivamos la vista para TODOS los que acceden a la sección (Admin/Vendedor)
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
      if (userToDelete) { deleteUser(userToDelete.id); loadUsers(); toast.success('Usuario eliminado'); }
      else if (productToDelete) { deleteProduct(productToDelete.id); loadProducts(); toast.success('Producto eliminado'); }
      setDeleteDialogOpen(false); setUserToDelete(null); setProductToDelete(null);
  };


 // --- RENDERIZADO DE SECCIONES ---
 const renderContent = () => {
  switch (activeSection) {
   case 'home':
        // ... (Contenido Home sin cambios)
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

            {/* CARD REPORTS (TODOS VEN) */}
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

              {/* Productos (Todos) */}
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

              {/* Reporte / Crecimiento (TODOS VEN) */}
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

              {/* Órdenes (Todos) */}
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

            {/* Acceso Rápido con Condicionales */}
      <Card className="border-border bg-card">
       <CardHeader>
        <CardTitle className="text-accent">Acceso Rápido</CardTitle>
                <CardDescription>Accede a las funciones principales</CardDescription>
       </CardHeader>
       <CardContent className="flex flex-wrap gap-4">
                {/* 💡 SOLO ADMIN: Gestionar Usuarios */}
                {!isSeller && (
        <Button
         onClick={() => setActiveSection('users')}
         className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
         <UsersIcon className="mr-2 h-4 w-4" />
         Gestionar Usuarios
        </Button>
                )}
                {/* 💡 TODOS: Gestionar Productos */}
        <Button 
         onClick={() => setActiveSection('products')}
         className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
         <Package className="mr-2 h-4 w-4" />
         Gestionar Productos
        </Button>

                {/* TODOS: Ver Órdenes (Acceso Directo) */}
                <Button 
                    onClick={() => setActiveSection('orders')}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Ver Órdenes
                </Button>

                {/* Ir A Tienda */}
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
        // Doble protección: Si es vendedor, no muestra nada aquí
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
            {/* 💡 La tabla de usuarios no acepta 'isAdmin' — el control de permisos lo maneja internamente o vía currentUser */}
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
              
              {/* Botón 'Nuevo Producto' oculto para Vendedores */}
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
            {/* 💡 Pasamos el rol para controlar editar/eliminar y View (Detalle) */}
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
      {/* 💡 Pasamos el usuario actual al Sidebar para que oculte opciones */}
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

      {/* Modales de Edición/Creación (Solo visibles para Administrador) */}
   {isAdmin && (
          <>
          {/* Modal de Usuario */}
          <UserFormModal
            isOpen={modalOpen}
            onClose={() => { setModalOpen(false); setSelectedUser(null); }}
            user={selectedUser}
            onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
          />
          {/* Modal de Producto */}
          {activeSection === 'products' && (
            <ProductFormModal
              isOpen={productModalOpen}
              onClose={() => { setProductModalOpen(false); setSelectedProduct(null); }}
              product={selectedProduct}
              onSubmit={handleSubmitProduct}
            />
          )}
          {/* 💡 FIX: Modal de Vista de Usuario - Reactivamos el modal de vista para Admin */}
          <UserViewModal
            isOpen={viewModalOpen && activeSection === 'users' && !!selectedUser} // Aseguramos que solo se muestre en sección 'users' y con un usuario seleccionado
            onClose={() => { setViewModalOpen(false); setSelectedUser(null); }}
            user={selectedUser}
          />
          </>
      )}

      {/* 💡 FIX: Modal de Detalle de Producto (Visible para TODOS los que tienen acceso a la sección products) */}
      {activeSection === 'products' && (
          <ProductViewModal
            isOpen={viewModalOpen && !!selectedProduct}
            onClose={() => { setViewModalOpen(false); setSelectedProduct(null); }}
            product={selectedProduct}
          />
      )}

      {/* Modal de Detalle de Orden (Visible para todos los que accedan a la sección Orders) */}
      <OrderDetailModal
        isOpen={viewModalOpen && activeSection === 'orders'}
        onClose={() => { setViewModalOpen(false); setSelectedOrder(null); }}
        order={selectedOrder}
      />
      
      {/* Diálogo de Confirmación (Solo Administrador lanza las acciones que lo necesitan) */}
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