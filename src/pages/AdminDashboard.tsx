import { useState, useEffect } from 'react';
import { User, UserFormData } from '@/types/user'; // FIX: Usando alias @/
// Importamos tipos de Producto
import { Product, ProductFormData } from '@/types/product'; // FIX: Usando alias @/

// Importaciones de USUARIOS desde storage.ts
import { getUsers, addUser, updateUser, deleteUser } from '@/lib/storage'; // FIX: Usando alias @/
// Importaciones de PRODUCTOS desde productStorage.ts (NUEVO)
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/productStorage'; // FIX: Usando alias @/
// Importación de datos demo. Asumimos que initializeDemoData solo inicializa USUARIOS.
import { initializeDemoData } from '@/lib/demoData'; // FIX: Usando alias @/

import { Header } from '@/components/layout/Header'; // FIX: Usando alias @/
import { Sidebar } from '@/components/layout/Sidebar'; // FIX: Usando alias @/
import { UserTable } from '@/components/admin/UserTable'; // FIX: Usando alias @/
import { UserModal } from '@/components/admin/UserModal'; // FIX: Usando alias @/
import { UserViewModal } from '@/components/admin/UserViewModal'; // FIX: Usando alias @/
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog'; // FIX: Usando alias @/
// Importamos componentes de Producto
import { ProductTable } from '@/components/admin/ProductTable'; // FIX: Usando alias @/
import { ProductModal } from '@/components/admin/ProductModal'; // FIX: Usando alias @/
import { ProductViewModal } from '@/components/admin/ProductViewModal'; // FIX: Usando alias @/

import { Button } from '@/components/ui/button'; // FIX: Usando alias @/
import { Plus, Users as UsersIcon, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // FIX: Usando alias @/

// --- Función que DEBES crear/llamar en tu lib/demoData.ts para inicializar productos ---
// Esto es necesario para que loadProducts() no devuelva un arreglo vacío la primera vez.
// Asumo que tienes una función initializeDemoProducts() que usa localStorage.setItem('levelup_products', JSON.stringify(data));
// Dado que no tengo el nombre exacto de la función, la llamo aquí de forma provisional.

const AdminDashboard = () => {
  // --- ESTADO DE USUARIOS (EXISTENTE) ---
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  // --- ESTADO DE PRODUCTOS (NUEVO) ---
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null); 
  
  // --- ESTADO DE UI Y MODALES ---
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false); // Para UserModal
  const [productModalOpen, setProductModalOpen] = useState(false); // Para ProductModal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  

  // --- LÓGICA DE CARGA DE DATOS ---
  useEffect(() => {
    // 1. Inicialización de datos DEMO (DEBES CREAR initializeDemoProducts() en lib/demoData.ts)
    initializeDemoData(); // Inicializa Usuarios
    // --- ESTO FALTA Y DEBE HACERSE MANUALMENTE EN lib/demoData.ts ---
    // initializeDemoProducts(); // Si no existe, los productos estarán vacíos.
    // ------------------------------------------------------------------

    loadUsers();
    loadProducts(); // Cargar productos al inicio
  }, []);

  const loadUsers = () => {
    setUsers(getUsers());
  };

  const loadProducts = () => {
    // Llama a la nueva función de almacenamiento de productos
    setProducts(getProducts());
  };

  // --- LÓGICA DE USUARIO (EXISTENTE) ---

  const handleCreateUser = (data: UserFormData) => {
    try {
      addUser(data);
      loadUsers();
      setModalOpen(false);
      toast.success('Usuario creado exitosamente');
    } catch (error) {
      toast.error('Error al crear usuario');
    }
  };

  const handleUpdateUser = (data: UserFormData) => {
    if (!selectedUser) return;
    try {
      updateUser(selectedUser.id, data);
      loadUsers();
      setModalOpen(false);
      setSelectedUser(null);
      toast.success('Usuario actualizado exitosamente');
    } catch (error) {
      toast.error('Error al actualizar usuario');
    }
  };

  const handleDeleteUser = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setUserToDelete({ id, name: user.name });
      setProductToDelete(null); // Limpiamos el estado de producto
      setDeleteDialogOpen(true);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const handleNewUser = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };
  
  // --- LÓGICA DE PRODUCTO (NUEVA) ---

  const handleNewProduct = () => {
    setSelectedProduct(null);
    setProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  };
  
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setViewModalOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      setProductToDelete({ id, name: product.name });
      setUserToDelete(null); // Limpiamos el estado de usuario
      setDeleteDialogOpen(true);
    }
  };

  const handleSubmitProduct = (data: ProductFormData) => {
    try {
      if (selectedProduct) {
        // Actualizar
        updateProduct(selectedProduct.id, data);
        toast.success('Producto actualizado exitosamente');
      } else {
        // Crear
        addProduct(data);
        toast.success('Producto creado exitosamente');
      }
      loadProducts();
      setProductModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      toast.error('Error al guardar producto');
    }
  };


  // --- LÓGICA DE CONFIRMACIÓN DE ELIMINACIÓN (UNIVERSAL) ---
  const confirmDelete = () => {
    if (userToDelete) {
      // Eliminar Usuario
      try {
        deleteUser(userToDelete.id);
        loadUsers();
        toast.success('Usuario eliminado exitosamente');
      } catch (error) {
        toast.error('Error al eliminar usuario');
      }
    } else if (productToDelete) {
      // Eliminar Producto
      try {
        deleteProduct(productToDelete.id);
        loadProducts();
        toast.success('Producto eliminado exitosamente');
      } catch (error) {
        toast.error('Error al eliminar producto');
      }
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
            <div>
              <h1 className="mb-2 text-4xl font-bold text-accent">
                Bienvenido Administrador
              </h1>
              <p className="text-xl text-muted-foreground">Panel de control Level-Up</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

              <Card className="border-border bg-card hover:border-accent/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Productos</CardTitle>
                  <Package className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  {/* Muestra el conteo real de productos */}
                  <div className="text-2xl font-bold text-accent">{products.length}</div> 
                  <p className="text-xs text-muted-foreground">Productos en inventario</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card hover:border-accent/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Órdenes</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">0</div>
                  <p className="text-xs text-muted-foreground">Próximamente</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card hover:border-accent/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Crecimiento</CardTitle>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">+0%</div>
                  <p className="text-xs text-muted-foreground">vs mes anterior</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-accent">Acceso Rápido</CardTitle>
                <CardDescription>Accede a las funciones principales</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button
                  onClick={() => setActiveSection('users')}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <UsersIcon className="mr-2 h-4 w-4" />
                  Gestionar Usuarios
                </Button>
                {/* Botón de Productos Activado */}
                <Button 
                  onClick={() => setActiveSection('products')}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Gestionar Productos
                </Button>
                <Button variant="outline" disabled>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Ver Órdenes
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="mb-2 text-4xl font-bold text-accent">Gestión de Usuarios</h1>
                <p className="text-lg text-muted-foreground">
                  Administra y visualiza todos los usuarios
                </p>
              </div>
              <Button
                onClick={handleNewUser}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            </div>

            <UserTable
              users={users}
              onEdit={handleEdit}
              onDelete={handleDeleteUser}
              onView={handleView}
            />
          </div>
        );

      case 'products':
        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="mb-2 text-4xl font-bold text-accent">Gestión de Productos</h1>
                <p className="text-lg text-muted-foreground">
                  Administra y visualiza todos los productos
                </p>
              </div>
              <Button
                onClick={handleNewProduct}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Button>
            </div>
            {/* RENDERIZAR TABLA DE PRODUCTOS */}
            <ProductTable
              products={products}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onView={handleViewProduct}
            />
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-6">
            <h1 className="mb-2 text-4xl font-bold text-accent">Gestión de Órdenes</h1>
            <Card className="border-border bg-card">
              <CardContent className="p-12 text-center">
                <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">
                  Sección de órdenes próximamente
                </p>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const itemToDeleteName = userToDelete?.name || productToDelete?.name || '';

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6">{renderContent()}</main>
      </div>

      {/* MODAL DE USUARIO (CREAR/EDITAR) */}
      <UserModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
      />
      
      {/* MODAL DE PRODUCTO (CREAR/EDITAR) */}
      {/* FIX: Renderizado condicional si la sección es 'products' */}
      {activeSection === 'products' && (
        <ProductModal
          isOpen={productModalOpen}
          onClose={() => {
            setProductModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onSubmit={handleSubmitProduct}
        />
      )}


      {/* MODAL DE VISTA DE USUARIO */}
      {activeSection === 'users' && (
        <UserViewModal
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}

      {/* MODAL DE VISTA DE PRODUCTO */}
      {activeSection === 'products' && (
        <ProductViewModal
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}

      {/* DIÁLOGO DE CONFIRMACIÓN DE ELIMINACIÓN (UNIVERSAL) */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
          setProductToDelete(null);
        }}
        onConfirm={confirmDelete}
        // FIX: Cambiamos userName por itemName para coincidir con la interfaz del diálogo
        itemName={userToDelete?.name || productToDelete?.name || ''} 
      />
    </div>
  );
};

export default AdminDashboard;