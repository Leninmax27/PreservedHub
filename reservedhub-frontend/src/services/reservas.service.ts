import api from './api';

export interface CrearReservaPayload {
  espacio: string;
  recursos?: string[];
  materia?: string | null;
  fechaInicio: string;
  fechaFin: string;
  motivo?: string;
}



export interface Reserva {
  _id: string;

  usuario?: {
    _id?: string;
    id?: string;
    nombre: string;
    apellido: string;
    correo: string;
    rol?: string;
  };

  espacio?: {
    _id: string;
    nombre: string;
    tipo?: string;
    codigo?: string;
  } | null;

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
    carrera?: {
      _id: string;
      nombre: string;
      codigo?: string;
      facultad?: {
        _id: string;
        nombre: string;
        codigo?: string;
      };
    };
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
  usuario?: string;
  espacio?: string;
  estado?: string;
  desde?: string;
  hasta?: string;
}

// GET /api/reservas (admin)
export const getReservas = async (
  filtros?: FiltrosReservas
): Promise<Reserva[]> => {
  const { data } = await api.get<Reserva[]>('/reservas', { params: filtros });
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

// ✅ GET /api/reservas/usuario/mis-reservas
export const getMisReservas = async (): Promise<Reserva[]> => {
  const { data } = await api.get<Reserva[]>('/reservas/usuario/mis-reservas');
  return data;
};

// Cancelar reserva (mejor que delete)
export const cancelarReserva = async (id: string): Promise<Reserva> => {
  return await updateEstadoReserva(id, 'CANCELADA');
};

// (Opcional) si aún quieres mantener delete
export const deleteReserva = async (id: string): Promise<void> => {
  await api.delete(`/reservas/${id}`);
};
