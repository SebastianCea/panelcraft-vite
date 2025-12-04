import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { initializeDemoData } from "@/lib/InitializeDemoData";
import { pb } from "@/lib/pocketbase"; // 🟢 Importamos el cliente de PocketBase

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
    // 1. Inicializar datos demo en localStorage (mantener esto mientras migramos)
    initializeDemoData();

    // 2. 🟢 Verificar conexión con PocketBase
    console.log("Intentando conectar a PocketBase en:", pb.baseUrl);
    
    pb.health.check()
      .then((health) => {
        console.log("✅ Conexión exitosa con PocketBase. Estado:", health);
      })
      .catch((err) => {
        console.error("❌ Error conectando a PocketBase. Asegúrate de que el servidor esté corriendo (./pocketbase serve)", err);
      });

  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* Usamos los flags 'future' para evitar warnings de React Router v7 */}
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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