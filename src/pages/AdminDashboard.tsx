import { useState, useEffect } from 'react';
import { User, UserFormData } from '@/types/user';
import { getUsers, addUser, updateUser, deleteUser } from '@/lib/storage';
import { initializeDemoData } from '@/lib/demoData';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { UserTable } from '@/components/admin/UserTable';
import { UserModal } from '@/components/admin/UserModal';
import { UserViewModal } from '@/components/admin/UserViewModal';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Plus, Users as UsersIcon, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    initializeDemoData();
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(getUsers());
  };

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
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    try {
      deleteUser(userToDelete.id);
      loadUsers();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      toast.success('Usuario eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar usuario');
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
                  <div className="text-2xl font-bold text-accent">0</div>
                  <p className="text-xs text-muted-foreground">Próximamente</p>
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
                <Button variant="outline" disabled>
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
            <h1 className="mb-2 text-4xl font-bold text-accent">Gestión de Productos</h1>
            <Card className="border-border bg-card">
              <CardContent className="p-12 text-center">
                <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">
                  Sección de productos próximamente
                </p>
              </CardContent>
            </Card>
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

      <UserModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
      />

      <UserViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
        userName={userToDelete?.name || ''}
      />
    </div>
  );
};

export default AdminDashboard;
