import { User } from "@/types/user";
import { LoginFormData } from "../validations/auth";
import { getUsers } from "../userStorage";


// Dominios permitidos para acceder al panel de administración
const ADMIN_ACCESS_DOMAINS = [
    'levelup.admin.cl', 
    'levelup.seller.cl'
];

// Clave para guardar la sesión en el navegador
const SESSION_KEY = 'levelup_session';

/**
 * Autentica al usuario y verifica credenciales.
 */
export const authenticateUser = ({ email, password }: LoginFormData): User => {
    const normalizedEmail = email.toLowerCase().trim();
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) throw new Error("Credenciales incorrectas. El usuario no existe.");
    if (user.password !== password) throw new Error("Credenciales incorrectas. Contraseña inválida.");

    return user;
};

/**
 * 🟢 NUEVO: Inicia sesión y guarda el usuario en localStorage
 */
export const login = (user: User): void => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    // Disparar un evento para que el Header se actualice automáticamente
    window.dispatchEvent(new Event('authChange'));
};

/**
 * 🟢 NUEVO: Cierra sesión
 */
export const logout = (): void => {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event('authChange'));
};

/**
 * 🟢 NUEVO: Obtiene el usuario conectado actualmente
 */
export const getCurrentUser = (): User | null => {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    try {
        return JSON.parse(data) as User;
    } catch {
        return null;
    }
};

/**
 * 🟢 NUEVO: Verifica si el usuario actual tiene acceso al panel
 */
export const hasAdminAccess = (): boolean => {
    const user = getCurrentUser();
    if (!user) return false;
    
    const domain = user.email.split('@')[1]?.toLowerCase();
    return ADMIN_ACCESS_DOMAINS.includes(domain) && user.userType !== 'Cliente';
};