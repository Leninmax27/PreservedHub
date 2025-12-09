import api from './api';

export type TipoRecurso =
  | 'COMPUTADORA'
  | 'PROYECTOR'
  | 'AUDIO'
  | 'VR'
  | 'CONSOLA'
  | 'KITS_LAB'
  | 'INSTRUMENTAL'
  | 'MOBILIARIO'
  | 'OTRO';

export interface Recurso {
  _id?: string;
  nombre: string;
  tipo: TipoRecurso;
  codigoInventario?: string;
  descripcion?: string;
  facultad: string;              // id de facultad
  espacio?: string | null;       // id de espacio o null
  cantidad: number;
  estado: 'DISPONIBLE' | 'RESERVADO' | 'MANTENIMIENTO' | 'INACTIVO';
}

export interface FiltroRecursos {
  facultad?: string;
  espacio?: string;
  tipo?: TipoRecurso;
  estado?: string;
}

export async function getRecursos(
  filtros?: FiltroRecursos
): Promise<Recurso[]> {
  const { data } = await api.get<Recurso[]>('/recursos', { params: filtros });
  return data;
}

export async function getRecursoById(id: string): Promise<Recurso> {
  const { data } = await api.get<Recurso>(`/recursos/${id}`);
  return data;
}

export async function crearRecurso(data: Recurso): Promise<Recurso> {
  const { data: created } = await api.post<Recurso>('/recursos', data);
  return created;
}

export async function actualizarRecurso(
  id: string,
  data: Partial<Recurso>
): Promise<Recurso> {
  const { data: updated } = await api.put<Recurso>(`/recursos/${id}`, data);
  return updated;
}

export async function eliminarRecurso(id: string) {
  return api.delete(`/recursos/${id}`);
}
