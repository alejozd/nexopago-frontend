// "completa" decide si el backend pasa la orden a RECIBIDA o
// PARCIALMENTE_RECIBIDA (sin tracking de cantidades, ver
// NexoPago.Services.EntradasMercancia).
export interface EntradaCreateDTO {
  ordenId: number;
  numeroEntradaHelisa: string;
  fechaEntrada: string;
  completa: boolean;
  observaciones: string | null;
}
