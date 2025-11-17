export interface OrderItem {
name: string;
quantity: number;
subTotal: number;  
discountPercentage: number;
total: number;   
}


export interface Order { 
id: string;
rutCliente: string; 
date: string; 

// Detalle de productos
items: OrderItem[]; 

total: number; // Total de los productos (globalSubtotal)

// CAMPOS DE PAGO Y ENVÍO
paymentId: string; 
paymentMethod: 'webpay'|'bancoestado'|'transferencia'; // Usamos los mismos valores que en Zod
statePago: 'Pendiente'|'Aprobado'|'Rechazado';

// CAMPOS DE ENTREGA (Nuevos campos del checkout, pueden ser opcionales)
Courier: 'retiro en tienda'|'envio'; // Usamos los valores de Zod
   addressDetail?: string; // Calle y número (si es envío)
   region?: string; // Región (si es envío)
   commune?: string; // Comuna (si es envío)
   branchOffice?: string; // Sucursal (si es retiro)

Tracking: string; 
statePedido: 'En preparación'|'Enviado'|'En camino'|'Recibido';

 // CAMPOS DE TOTALES
 globalSubtotal: number; 
 globalDiscount: number; 
 finalTotal: number; 
}