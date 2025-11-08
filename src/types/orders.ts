export interface Orders {
  id: string;
  rut: string;
  date: Date;
  detail: string; //seria un link supongo que me lleve al detalle de compras? No lo se, explica como puedo manejarlo.
  total: number;
  IdPago: number;
  statePago: 'Pendiente'|'Aprobado'|'Rechazado';
  Courier?: string;
  Tracking: number;
  statePedido: 'En preparación'|'Enviado'|'En camino'|'Recibido';
}

