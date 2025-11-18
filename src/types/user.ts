export interface User {
 id: string;
 rut: string;
 name: string;
 email: string;
 birthdate: string;
 userType: 'Cliente' | 'Vendedor' | 'Administrador';
 
 // 🔴 CAMPO ANTERIOR: address contenía toda la dirección
 // address: string; 
    
 // 🟢 NUEVOS CAMPOS DE UBICACIÓN
    region: string; // Región del usuario
    comuna: string; // Comuna del usuario
    address: string; // Detalle de dirección (Calle, número, etc.)

 createdAt: string;
 updatedAt: string;
}

// UserFormData ahora incluye los nuevos campos
export type UserFormData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;