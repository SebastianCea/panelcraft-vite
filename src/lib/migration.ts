import { pb } from './pocketbase';
import { Order } from '@/types/order';

// Datos de las órdenes demo completados con la estructura requerida
const demoOrdersData: Omit<Order, 'id' | 'created' | 'updated' | 'collectionId' | 'collectionName'>[] = [
  {
    rutCliente: '12.345.678-9', // Juan Pérez
    date: '01-12-2023',
    items: [
      { name: "PlayStation 5 Slim", quantity: 1, subTotal: 549990, discountPercentage: 0, total: 549990 },
      { name: "Mouse Gamer Logitech", quantity: 1, subTotal: 49990, discountPercentage: 0, total: 49990 }
    ],
    total: 599980,
    // Detalles de Pago
    paymentMethod: 'webpay',
    paymentId: 'PAY-DEMO-001',
    statePago: 'Aprobado',
    // Detalles de Envío
    Courier: 'envio',
    addressDetail: 'Av. Siempre Viva 742',
    region: 'Metropolitana',
    commune: 'Santiago',
    branchOffice: '',
    Tracking: 'TRK-99887766',
    statePedido: 'Recibido',
    // Totales Globales
    globalSubtotal: 599980,
    globalDiscount: 0,
    finalTotal: 599980
  },
  {
    rutCliente: '22.222.222-2', // Vendedor (compra de prueba)
    date: '15-01-2024',
    items: [
      { name: "Teclado Mecánico RGB", quantity: 1, subTotal: 89990, discountPercentage: 0, total: 89990 }
    ],
    total: 89990,
    // Detalles de Pago
    paymentMethod: 'transferencia',
    paymentId: 'TRF-123456',
    statePago: 'Aprobado',
    // Detalles de Envío
    Courier: 'envio',
    addressDetail: 'Calle Comercial 55',
    region: 'Valparaíso',
    commune: 'Viña del Mar',
    branchOffice: '',
    Tracking: 'TRK-55443322',
    statePedido: 'En camino',
    // Totales Globales
    globalSubtotal: 89990,
    globalDiscount: 0,
    finalTotal: 89990
  },
  {
    rutCliente: '11.111.111-1', // Diego Admin
    date: '20-02-2024',
    items: [
        { name: "Catan", quantity: 2, subTotal: 91980, discountPercentage: 0, total: 91980 },
        { name: "Polera Level-Up", quantity: 1, subTotal: 19990, discountPercentage: 0, total: 19990 }
    ],
    total: 111970,
    // Detalles de Pago
    paymentMethod: 'bancoestado',
    paymentId: 'BE-987654',
    statePago: 'Pendiente',
    // Detalles de Envío
    Courier: 'retiro en tienda',
    addressDetail: '', // No aplica en retiro
    region: 'Metropolitana',
    commune: 'Providencia',
    branchOffice: 'Sucursal Central',
    Tracking: '',
    statePedido: 'En preparación',
    // Totales Globales
    globalSubtotal: 111970,
    globalDiscount: 0,
    finalTotal: 111970
  }
];

export const migrateOrders = async () => {
  console.log("🚀 Iniciando migración de órdenes...");
  let successCount = 0;

  for (const order of demoOrdersData) {
    try {
      // Verificar si ya existe una orden con este ID de pago para no duplicar
      const exists = await pb.collection('orders').getList(1, 1, {
        filter: `paymentId = "${order.paymentId}"`
      });

      if (exists.totalItems === 0) {
        await pb.collection('orders').create(order);
        console.log(`✅ Orden creada: ${order.paymentId} (Cliente: ${order.rutCliente})`);
        successCount++;
      } else {
        console.log(`ℹ️ La orden ${order.paymentId} ya existe. Saltando...`);
      }
    } catch (error) {
      console.error(`❌ Error creando orden ${order.paymentId}:`, error);
    }
  }

  console.log(`✨ Migración finalizada. ${successCount} órdenes creadas.`);
  alert(`Migración finalizada: ${successCount} órdenes creadas.`);
};