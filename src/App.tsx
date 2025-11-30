import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react"; 
import { initializeDemoData } from "@/lib/InitializeDemoData"; 

import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Cart from "./pages/Cart";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import FrontPage from "./pages/FrontPage.tsx";
import ProductDetail from "./pages/ProductDetail";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // 1. Inicializar datos demo
    initializeDemoData();

    // 2. 🟢 LISTENER GLOBAL DE SINCRONIZACIÓN ENTRE PESTAÑAS 🟢
    // Este evento se dispara cuando OTRA pestaña modifica el localStorage
    const handleStorageChange = (event: StorageEvent) => {
      // Si la clave de sesión ('levelup_session') fue eliminada (newValue === null)
      if (event.key === 'levelup_session' && event.newValue === null) {
        // Disparamos manualmente el evento 'authChange' en ESTA pestaña
        // para que los componentes (Header, Cart, etc.) se actualicen.
        window.dispatchEvent(new Event('authChange'));
      }
      // Opcional: Si se inicia sesión en otra pestaña también podemos sincronizar
      if (event.key === 'levelup_session' && event.newValue) {
        window.dispatchEvent(new Event('authChange'));
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<FrontPage/>} />
            <Route path="/home" element={<Home />} />
            <Route path="/categorias" element={<Categories />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
            <Route path="/perfil" element={<Profile />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;