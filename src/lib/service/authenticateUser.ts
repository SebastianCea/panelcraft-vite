import { User, LoginCredentials, AuthResponse } from '@/types/user';
import { pb } from '@/lib/pocketbase'; // Asegúrate de importar la instancia de pocketbase

const CURRENT_USER_KEY = 'levelup_current_user';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    // 🟢 USAR AUTENTICACIÓN NATIVA DE POCKETBASE
    const authData = await pb.collection('users').authWithPassword(
      credentials.email,
      credentials.password
    );

    if (authData && authData.record) {
      // PocketBase devuelve el registro del usuario en authData.record
      // Mapeamos los campos de PocketBase a nuestra interfaz User si es necesario
      // O simplemente usamos el record si coincide.
      // Asegúrate de que tu interfaz User coincida con lo que devuelve PB o haz un cast.
      const user = authData.record as unknown as User; 

      // Guardar sesión local (opcional si usas pb.authStore, pero mantenemos tu lógica)
      updateLocalSession(user);

      return {
        success: true,
        user: user,
      };
    }

    return {
      success: false,
      message: 'Credenciales inválidas',
    };

  } catch (error) {
    console.error("Error en login:", error);
    // PocketBase lanza un error 400 si las credenciales son malas
    const errorMessage = (error as any)?.data?.message || 'Error al intentar iniciar sesión. Verifica tus credenciales.';
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// 🟢 ALIAS RESTAURADO
export const authenticateUser = login;

// 🟢 NUEVA FUNCIÓN: Actualiza la sesión local sin requerir password
export const updateLocalSession = (user: User) => {
    const sessionUser = { ...user };
    
    if (sessionUser.password) {
        delete sessionUser.password; 
    }
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
    // También es buena práctica mantener el authStore de PB actualizado si lo usas en otros lados
    // pb.authStore.save(token, user); 
    window.dispatchEvent(new Event('authChange'));
};

export const logout = () => {
  pb.authStore.clear(); // Limpiar sesión de PocketBase
  localStorage.removeItem(CURRENT_USER_KEY);
  window.dispatchEvent(new Event('authChange'));
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const hasAdminAccess = (): boolean => {
  const user = getCurrentUser();
  return user?.userType === 'Administrador' || user?.userType === 'Vendedor';
};