import api from './api';

export type TicketEstado = 'EMITIDO' | 'USADO' | 'CANCELADO';

export interface Ticket {
  _id: string;
  codigo: string;
  estado: TicketEstado;
  createdAt: string;
  updatedAt: string;
  usuario?: any;
  reserva?: any;
}

export async function listarMisTickets(usuarioId: string): Promise<Ticket[]> {
  const { data } = await api.get('/tickets', { params: { usuario: usuarioId } });
  return data;
}

export async function obtenerTicketPorReserva(reservaId: string): Promise<Ticket> {
  const { data } = await api.get(`/tickets/reserva/${reservaId}`);
  return data;
}
