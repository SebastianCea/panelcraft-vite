import { User } from "@/types/user";

// --- DATOS DE USUARIOS (ACTUALIZADO AL NUEVO TIPO DE USER) ---
// Ahora incluye 'region' y 'comuna'
export const demoUsers: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [
 {
  rut: '12345678-9', 
  name: 'Pablo Neruda',
  email: 'pablo@gmail.com', // Correo Cliente (Gmail)
  birthdate: '1904-07-12',
  userType: 'Cliente',
  region: 'Región del Biobío',
  comuna: 'Concepción',
  address: 'Calle Falsa 123, Lomas Verdes',
 },
 {
  rut: '43434312-1',
  name: 'Víctor Jara',
  email: 'victor@duocuc.cl', // Correo cliente 
  birthdate: '1932-09-28',
  userType: 'Cliente',
  region: 'Región Metropolitana',
  comuna: 'Santiago',
  address: 'Avenida Siempreviva 742, Depto 1A',
 },
 {
  rut: '98765432-1',
  name: 'Gabriela Mistral',
  email: 'gabriela@levelup.seller.cl', //Dominio Seller
  birthdate: '1889-04-07',
  userType: 'Vendedor',
  region: 'Región de Valparaíso',
  comuna: 'Valparaíso',
  address: 'Paseo Bulnes 456, Cerro Alegre',
 },
 {
  rut: '32132132-1', 
  name: 'Diego Maradona',
  email: 'diego@levelup.admin.cl', // Correo Administrador (Dominio Admin)
  birthdate: '1960-10-30', // Fecha de nacimiento de Diego Maradona
  userType: 'Administrador', 
  region: 'Región Metropolitana',
  comuna: 'Santiago',
  address: 'Cancha N° 10, Buenos Aires',
 },
];