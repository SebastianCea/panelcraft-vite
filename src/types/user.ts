export interface User {
 // PocketBase siempre devuelve estos campos de sistema
 id: string;
 collectionId?: string;
 collectionName?: string;
 created?: string;
 updated?: string;

 // Tus campos personalizados
 rut: string;
 name: string;
 email: string;
 password?: string; // Opcional porque al leer de la DB no siempre viene la pass
 birthdate: string;
 userType: 'Cliente' | 'Vendedor' | 'Administrador';
 
 // Ubicación
 region: string;
 comuna: string;
 address: string;

 // Descuento
 discountPercentage?: number;

 // Compatibilidad con tu código anterior (mapeo de campos)
 createdAt?: string; // Mapearemos 'created' a este si es necesario
 updatedAt?: string; // Mapearemos 'updated' a este si es necesario
}

// UserFormData para creación: NO debe incluir ID ni fechas de sistema
export type UserFormData = Omit<User, 'id' | 'collectionId' | 'collectionName' | 'created' | 'updated' | 'createdAt' | 'updatedAt'>;

// 🟢 Tipos necesarios para la autenticación
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    user?: Omit<User, 'password'>; // El usuario sin contraseña
    message?: string;
    token?: string; // Opcional, si usas tokens JWT más adelante
}