export interface OrderItem {
 name: string;
 quantity: number;
 subTotal: number;   
 discountPercentage: number;
 total: number;     
}


export interface Order { // 💡 Mejor llamarla Order (singular)
 id: string;
 rutCliente: string; // 💡 Renombrado a rutCliente para mayor claridad
 date: string; // 💡 Usar 'string' ('30-09-2025') es mejor que 'Date' para localStorage
 
 // 💡 REEMPLAZA EL CAMPO 'detail' por el array de ítems (El verdadero detalle)
 items: OrderItem[]; 

 total: number; // Total de la tabla principal
 
 // CAMPOS DE PAGO Y ENVÍO
 paymentId: string; 
 paymentMethod: 'Webpay'|'BancoEstado'|'Transferencia'; // Añadido un enum para método
 statePago: 'Pendiente'|'Aprobado'|'Rechazado';
 Courier?: string; // Optional (opcional)
 Tracking: string; // 💡 Mejor como string (ej: 'TRACK-5555')
 statePedido: 'En preparación'|'Enviado'|'En camino'|'Recibido';

  // 💡 CAMPOS DEL MODAL DE TOTALES (Vistos en la imagen de detalle de compra)
  globalSubtotal: number; 
  globalDiscount: number; 
  finalTotal: number; 
}