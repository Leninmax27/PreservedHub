import api from './api';

export interface CrearReservaPayload {
  espacio: string;
  recursos?: string[];          // IDs de recursos (opcional)
  materia?: string | null;
  fechaInicio: string;          // ISO string
  fechaFin: string;             // ISO string
  motivo?: string;
}

// Lo que devuelve el backend (según reserva.model.js + populate de reservas.routes.js)
export interface Reserva {
  _id: string;

  usuario?: {
    _id: string;
    nombre: string;
    apellido: string;
    correo: string;
    rol?: string;
  };

  espacio: {
    _id: string;
    nombre: string;
    tipo?: string;
    codigo?: string;
  };

  recursos?: {
    _id: string;
    nombre: string;
    tipo?: string;
    codigoInventario?: string;
  }[];

  materia?: {
    _id: string;
    nombre: string;
    codigo?: string;
  } | null;

  fechaInicio: string;
  fechaFin: string;
  motivo?: string;

  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'RECHAZADA' | 'FINALIZADA';

  createdAt?: string;
  updatedAt?: string;
}

// Crear reserva (usuario autenticado)
export const crearReserva = async (
  payload: CrearReservaPayload
): Promise<Reserva> => {
  const { data } = await api.post<Reserva>('/reservas', payload);
  return data;
};

// ===== ADMIN / LISTADO GENERAL =====

export interface FiltrosReservas {
  usuario?: string;  // id de usuario
  espacio?: string;  // id de espacio
  estado?: string;
  desde?: string;    // YYYY-MM-DD o ISO
  hasta?: string;    // YYYY-MM-DD o ISO
}

// GET /api/reservas  (admin)
export const getReservas = async (
  filtros?: FiltrosReservas
): Promise<Reserva[]> => {
  const { data } = await api.get<Reserva[]>('/reservas', {
    params: filtros,
  });
  return data;
};

// GET /api/reservas/:id
export const getReservaById = async (id: string): Promise<Reserva> => {
  const { data } = await api.get<Reserva>(`/reservas/${id}`);
  return data;
};

// PATCH /api/reservas/:id/estado
export const updateEstadoReserva = async (
  id: string,
  estado: Reserva['estado']
): Promise<Reserva> => {
  const { data } = await api.patch<Reserva>(`/reservas/${id}/estado`, { estado });
  return data;
};

// ===== MÓDULO "MIS RESERVAS" (USUARIO) =====

// GET /api/reservas/mis-reservas
export const getMisReservas = async (): Promise<Reserva[]> => {
  const { data } = await api.get<Reserva[]>('/reservas/mis-reservas');
  return data;
};
