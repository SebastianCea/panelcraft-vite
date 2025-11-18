import { User } from "@/types/user";

// --- DATOS DE USUARIOS (ACTUALIZADO AL NUEVO TIPO DE USER) ---
// Ahora incluye 'region' y 'comuna'
export const demoUsers: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [
 {
 // RUT sin puntos, solo con guion, como dicta la validación
 rut: '12345678-9', 
 name: 'Pablo Neruda',
 email: 'pablito@levelup.cl',
 birthdate: '1904-07-12',
 userType: 'Cliente',
 // 💡 Nuevos campos de ubicación
 region: 'Región del Biobío',
 comuna: 'Concepción',
 address: 'Calle Falsa 123, Lomas Verdes',
 },
 {
 rut: '43434312-1',
 name: 'Víctor Jara',
 email: 'victor.jara@levelup.cl',
 birthdate: '1932-09-28',
 userType: 'Vendedor',
 // 💡 Nuevos campos de ubicación
 region: 'Región Metropolitana',
 comuna: 'Santiago',
 address: 'Avenida Siempreviva 742, Depto 1A',
 },
 {
 rut: '98765432-1',
 name: 'Gabriela Mistral',
 email: 'gmistral@levelup.cl',
 birthdate: '1889-04-07',
 userType: 'Administrador',
 // 💡 Nuevos campos de ubicación
 region: 'Región de Valparaíso',
 comuna: 'Valparaíso',
 address: 'Paseo Bulnes 456, Cerro Alegre',
 },
  {
 rut: '321321321-1',
 name: 'Diego Maradona',
 email: 'D10S@levelup.cl',
 birthdate: '1965-04-07',
 userType: 'Administrador',
 // 💡 Nuevos campos de ubicación
 region: 'Región de Valparaíso',
 comuna: 'Valparaíso',
 address: 'Paseo Bulnes 456, Cerro Alegre',
 },
];