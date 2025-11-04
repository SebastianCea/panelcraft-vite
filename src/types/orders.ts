export interface Orders {
  id: string;
  rut: string;
  date: Date;
  total: number;
  IdPago: number;
  Courier?: string;
  Tracking: number;
}

