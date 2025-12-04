export interface OrderItem {
  name: string;
  quantity: number;
  subTotal: number;  
  discountPercentage: number;
  total: number;   
}

export interface Order { 
  // Campos de sistema de PocketBase (Opcionales al crear, obligatorios al leer)
  id: string;
  collectionId?: string;
  collectionName?: string;
  created?: string; // 🟢 Este es el campo que te estaba dando error
  updated?: string;

  rutCliente: string; 
  date: string; // Mantenemos tu campo fecha manual por compatibilidad

  // Detalle de productos
  items: OrderItem[]; 

  total: number; // Total de los productos (globalSubtotal)

  // CAMPOS DE PAGO Y ENVÍO
  paymentId: string; 
  paymentMethod: 'webpay'|'bancoestado'|'transferencia'; 
  statePago: 'Pendiente'|'Aprobado'|'Rechazado';

  // CAMPOS DE ENTREGA
  Courier: 'retiro en tienda'|'envio'; 
  addressDetail?: string; 
  region?: string; 
  commune?: string; 
  branchOffice?: string; 

  Tracking: string; 
  statePedido: 'En preparación'|'Enviado'|'En camino'|'Recibido';

  // CAMPOS DE TOTALES
  globalSubtotal: number; 
  globalDiscount: number; 
  finalTotal: number; 
}