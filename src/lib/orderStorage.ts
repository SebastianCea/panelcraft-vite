import { pb } from './pocketbase';
import { Order } from '@/types/order';

const COLLECTION_NAME = 'orders';

// --- OBTENER TODAS LAS ÓRDENES ---
export const getOrders = async (): Promise<Order[]> => {
    try {
        return await pb.collection(COLLECTION_NAME).getFullList<Order>({
            sort: '-created',
        });
    } catch (error) {
        console.error("Error al obtener órdenes:", error);
        return [];
    }
};

// --- CREAR UNA ORDEN ---
export const addOrder = async (orderData: Omit<Order, 'id'>): Promise<Order> => {
    try {
        const newOrder = await pb.collection(COLLECTION_NAME).create<Order>(orderData);
        return newOrder;
    } catch (error) {
        console.error("Error al crear la orden:", error);
        throw error;
    }
};

// --- BUSCAR ÓRDENES (Filtro Local) ---
// PocketBase tiene un sistema de filtros potente, pero para mantener
// la lógica de tu buscador actual, podemos traer todo y filtrar en el cliente
// o implementar filtros de servidor más adelante.
export const searchOrders = async (searchTerm: string): Promise<Order[]> => {
    const term = searchTerm.toLowerCase().trim();
    const allOrders = await getOrders();

    if (!term) return allOrders;

    return allOrders.filter(order => 
        order.id.toLowerCase().includes(term) ||
        order.rutCliente.toLowerCase().includes(term) ||
        order.Courier?.toLowerCase().includes(term) ||
        order.paymentMethod.toLowerCase().includes(term)
    );
};

// --- MÉTRICAS SIMPLES ---
export const calculateGrowthRate = async (): Promise<{ percentage: number, comparisonPeriod: string }> => {
    // Traemos todas las órdenes para calcular en memoria
    // (En una app real con miles de ventas, esto se haría con una query de agregación en el backend)
    const allOrders = await getOrders();
    const now = new Date();
    const currentMonthIndex = now.getMonth(); 
    const currentYear = now.getFullYear();

    // Helper para sumar totales
    const calculateTotalSales = (orders: Order[]) => orders.reduce((sum, item) => sum + item.finalTotal, 0);

    const salesData = allOrders.map(order => {
        // Manejo robusto de fecha (si viene de PB es YYYY-MM-DD HH:mm:ss, si es local DD-MM-YYYY)
        let orderDate = new Date(order.created || order.date); 
        if (isNaN(orderDate.getTime())) {
             // Fallback para formato manual antiguo
             const parts = order.date.split('-'); 
             orderDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        return { total: order.finalTotal, date: orderDate };
    });

    const lastPeriodDate = new Date(currentYear, currentMonthIndex);
    const prevPeriodDate = new Date(currentYear, currentMonthIndex - 1); 

    const salesLastPeriod = salesData.filter(item => 
        item.date.getMonth() === lastPeriodDate.getMonth() && item.date.getFullYear() === lastPeriodDate.getFullYear()
    );
    
    const salesPrevPeriod = salesData.filter(item => 
        item.date.getMonth() === prevPeriodDate.getMonth() && item.date.getFullYear() === prevPeriodDate.getFullYear()
    );

    const totalLastPeriod = calculateTotalSales(salesLastPeriod as any);
    const totalPrevPeriod = calculateTotalSales(salesPrevPeriod as any);

    if (totalPrevPeriod === 0) {
        const percentage = totalLastPeriod > 0 ? 1 : 0;
        return { percentage, comparisonPeriod: 'vs mes anterior' };
    }

    const growth = (totalLastPeriod - totalPrevPeriod) / totalPrevPeriod;
    const monthName = prevPeriodDate.toLocaleDateString('es-CL', { month: 'short' });

    return { percentage: growth, comparisonPeriod: `vs ${monthName}` };
};