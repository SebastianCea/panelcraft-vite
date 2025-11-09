// src/storage/orderService.ts
import { Order } from '@/types/order';
import { demoOrders } from './ordersData'; // Importamos los datos simulados

const STORAGE_KEY = 'levelup_orders';

// -------------------------------------------------------------------
// FUNCIONES BÁSICAS DE STORAGE (Lectura/Escritura en localStorage)
// -------------------------------------------------------------------

/**
 * Lee todas las órdenes desde localStorage. Si no hay datos, inicializa con los datos demo.
 * @returns Array de todas las órdenes.
 */
export const getOrders = (): Order[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    
    // Si no hay datos en localStorage, inicializamos y devolvemos los datos demo
    if (!data) {
        saveOrders(demoOrders);
        return demoOrders;
    }
    
    try {
        return JSON.parse(data) as Order[];
    } catch (error) {
        console.error("Error al parsear datos de órdenes:", error);
        return [];
    }
};

/**
 * Guarda el array completo de órdenes en localStorage.
 * @param orders Array de órdenes a guardar.
 */
export const saveOrders = (orders: Order[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};


// -------------------------------------------------------------------
// LÓGICA DE NEGOCIO Y BÚSQUEDA (Funciones consumidas por los componentes)
// -------------------------------------------------------------------

/**
 * Filtra las órdenes basándose en un término de búsqueda (ID, RUT, o Courier).
 * @param searchTerm Término a buscar (ej: '12.345.678-9', 'Starken', '00123').
 * @returns Array de órdenes que coinciden con el término.
 */
export const searchOrders = (searchTerm: string): Order[] => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return getOrders(); // Si el término está vacío, devuelve todas las órdenes

    const allOrders = getOrders();

    return allOrders.filter(order => 
        order.id.toLowerCase().includes(term) ||
        order.rutCliente.toLowerCase().includes(term) ||
        order.Courier?.toLowerCase().includes(term) ||
        order.paymentMethod.toLowerCase().includes(term)
    );
};

/**
 * Filtra las órdenes por estado de pago o estado de envío.
 * @param type 'statePago' o 'statePedido'.
 * @param status Valor del estado (ej: 'Aprobado', 'En camino').
 * @returns Array de órdenes filtradas.
 */
export const filterOrdersByStatus = (
    type: 'statePago' | 'statePedido', 
    status: string
): Order[] => {
    const allOrders = getOrders();
    
    if (!status) return allOrders;

    return allOrders.filter(order => order[type] === status);
};

// -------------------------------------------------------------------
// LÓGICA DE NEGOCIO: Métricas (Si quisieras un contador)
// -------------------------------------------------------------------

/**
 * Calcula un resumen de cuántas órdenes hay en cada estado de pago.
 * @returns Un objeto con el recuento por estado de pago.
 */
export const getPaymentStatusSummary = () => {
    const allOrders = getOrders();
    const summary = {
        Aprobado: 0,
        Pendiente: 0,
        Rechazado: 0,
    };

    allOrders.forEach(order => {
        if (order.statePago in summary) {
            summary[order.statePago as keyof typeof summary] += 1;
        }
    });

    return summary;
};




// src/lib/orderStorage.ts

// ... (tus imports y funciones existentes como getOrders, saveOrders, searchOrders)

// Función auxiliar para obtener el total de ventas (usando finalTotal)
const calculateTotalSales = (salesData: { total: number; date: Date }[]): number => {
    // Suma la propiedad 'total' de los objetos que pasas
    return salesData.reduce((sum, item) => sum + item.total, 0); 
};

// src/lib/orderStorage.ts

// ... (calculateTotalSales function is correct)

/**
 * Calcula la variación porcentual de ventas (ingresos) entre el mes actual y el mes anterior.
 */
export const calculateGrowthRate = (): { percentage: number, comparisonPeriod: string } => {
    const allOrders = getOrders();
    const now = new Date();
    
    // Obtener los índices de mes (0-11) y el año actual
    const currentMonthIndex = now.getMonth(); 
    const currentYear = now.getFullYear();

    // 1. Mapeo y Normalización de Datos
    const salesData = allOrders.map(order => {
        const parts = order.date.split('-'); // Suponemos DD-MM-YYYY
        
        // 💡 CORRECCIÓN CRÍTICA: La forma más segura de construir una fecha a partir de DD-MM-YYYY.
        // Usamos el constructor new Date(YYYY, MM - 1, DD)
        const orderDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        
        // Aseguramos que la fecha sea comparada sin la hora del día, lo cual a veces causa problemas.
        // Aunque el problema de fondo es que tu demoOrders tiene pocos datos por mes.

        return { total: order.finalTotal, date: orderDate };
    });

    // 2. Definir los períodos de comparación usando la capacidad de JS para ajustar fechas

    // Período Actual (El mes que estamos viviendo ahora)
    const lastPeriodDate = new Date(currentYear, currentMonthIndex);
    
    // Período Anterior (JS maneja el cambio de año automáticamente, ej: new Date(2025, -1) -> Dec 2024)
    const prevPeriodDate = new Date(currentYear, currentMonthIndex - 1); 

    const salesLastPeriod = salesData.filter(item => 
        item.date.getMonth() === lastPeriodDate.getMonth() && item.date.getFullYear() === lastPeriodDate.getFullYear()
    );
    
    const salesPrevPeriod = salesData.filter(item => 
    item.date.getMonth() === prevPeriodDate.getMonth() && item.date.getFullYear() === prevPeriodDate.getFullYear()
    );

    // 3. Sumar totales
    const totalLastPeriod = calculateTotalSales(salesLastPeriod);
    const totalPrevPeriod = calculateTotalSales(salesPrevPeriod);

    // 4. Calcular la variación
    if (totalPrevPeriod === 0) {
        const percentage = totalLastPeriod > 0 ? 1 : 0;
        return { percentage, comparisonPeriod: 'vs mes anterior' };
    }

    const growth = (totalLastPeriod - totalPrevPeriod) / totalPrevPeriod;

    // Obtener la abreviación del mes anterior para el texto
    const monthName = prevPeriodDate.toLocaleDateString('es-CL', { month: 'short' });

    return { percentage: growth, comparisonPeriod: `vs ${monthName}` };
};