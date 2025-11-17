import { Order } from '../types/order'; // Asegúrate de que la ruta sea correcta

export const demoOrders: Order[] = [
 // --- ORDEN 1: Envío a domicilio ---
 {
  id: '00123', rutCliente: '12.345.678-9', date: '30-09-2025',
  total: 20000, paymentMethod: 'webpay', paymentId: '8888', statePago: 'Aprobado',
  Courier: 'envio', 
    addressDetail: 'Av. Las Condes 9000', region: 'metropolitana', commune: 'lascondes', 
    Tracking: '5555', statePedido: 'En camino',
  globalSubtotal: 22200, globalDiscount: 2200, finalTotal: 20000,
  items: [
   { name: 'Producto A', quantity: 2, subTotal: 10000, discountPercentage: 0.10, total: 9000 },
   { name: 'Producto B', quantity: 1, subTotal: 7500, discountPercentage: 0.00, total: 7500 },
   { name: 'Producto C', quantity: 3, subTotal: 6000, discountPercentage: 0.05, total: 5700 },
  ],
 },
 
 // --- ORDEN 2: Envío a domicilio ---
 {
  id: '0112', rutCliente: '9.876.432-1', date: '19-09-2025',
  total: 40000, paymentMethod: 'bancoestado', paymentId: '123123', statePago: 'Aprobado',
  Courier: 'envio', 
    addressDetail: 'Calle Sur 456', region: 'biobio', commune: 'concepcion',
    Tracking: '321321', statePedido: 'En preparación',
  globalSubtotal: 40000, globalDiscount: 0, finalTotal: 40000,
  items: [
   { name: 'Auriculares HyperX', quantity: 1, subTotal: 79990, discountPercentage: 0.50, total: 40000 },
  ],
 },
 
 // --- ORDEN 3: Retiro en tienda (sucursal) ---
 {
  id: '0030', rutCliente: '22.333.444-5', date: '05-10-2025',
  total: 12990, paymentMethod: 'transferencia', paymentId: '9902', statePago: 'Pendiente', 
  Courier: 'retiro en tienda', 
    branchOffice: 'Santiago (Av. Central 123)', // Retiro
    Tracking: '0000', statePedido: 'En preparación',
  globalSubtotal: 12990, globalDiscount: 0, finalTotal: 12990,
  items: [
   { name: 'Polera Level-Up', quantity: 1, subTotal: 12990, discountPercentage: 0.00, total: 12990 },
  ],
 },

 // --- ORDEN 4: Envío a domicilio ---
 {
  id: '0031', rutCliente: '11.555.222-1', date: '25-10-2025',
  total: 150000, paymentMethod: 'webpay', paymentId: '6655', statePago: 'Aprobado', 
  Courier: 'envio', 
    addressDetail: 'Río Calle-Calle 789', region: 'losrios', commune: 'valdivia',
    Tracking: '7788', statePedido: 'Enviado',
  globalSubtotal: 150000, globalDiscount: 0, finalTotal: 150000,
  items: [
   { name: 'PC Gamer RTX', quantity: 1, subTotal: 1499900, discountPercentage: 0.90, total: 150000 },
  ],
 },
 
 // --- ORDEN 5: Envío a domicilio ---
 {
  id: '0032', rutCliente: '32.123.321.1', date: '08-11-2025',
  total: 30000, paymentMethod: 'bancoestado', paymentId: '4321', statePago: 'Aprobado',
  Courier: 'envio', 
    addressDetail: 'Av.Central 1234', region: 'metropolitana', commune: 'providencia',
    Tracking: '5431', statePedido: 'Enviado',
  globalSubtotal: 30000, globalDiscount: 0, finalTotal: 30000, 
  items: [
   { name: 'Juegos de Mesa Catan', quantity: 1, subTotal: 30000, discountPercentage: 0.00, total: 30000 },
  ],
 },

 // --- ORDEN 6: Retiro en tienda ---
 {
  id: '0033', rutCliente: '77.777.777-7', date: '09-11-2025',
  total: 45000, paymentMethod: 'transferencia', paymentId: '1234', statePago: 'Aprobado',
  Courier: 'retiro en tienda', 
    branchOffice: 'Concepcion (Calle Sur 456)',
    Tracking: '9999', statePedido: 'En preparación',
  globalSubtotal: 45000, globalDiscount: 0, finalTotal: 45000,
  items: [
   { name: 'Mouse Gamer Logitech G502', quantity: 1, subTotal: 45000, discountPercentage: 0.00, total: 45000 },
  ],
 },

];