import api from './api';

export type TipoEspacio = 'AULA' | 'LABORATORIO' | 'AUDITORIO' | 'SALA';
export type EstadoEspacio = 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO';

export interface Espacio {
  _id?: string;
  nombre: string;
  codigo?: string;
  tipo: TipoEspacio;
  capacidad: number;
  ubicacion?: string;
  facultad: string; // ObjectId de facultad
  estado?: EstadoEspacio;
}

export interface FiltrosEspacios {
  facultad?: string;
  tipo?: TipoEspacio | '';
  estado?: EstadoEspacio | '';
  capacidadMin?: number | null;
  capacidadMax?: number | null;
}

export async function getEspacios(filtros?: FiltrosEspacios): Promise<Espacio[]> {
  const params: any = {};

  if (filtros?.facultad) params.facultad = filtros.facultad;
  if (filtros?.tipo) params.tipo = filtros.tipo;
  if (filtros?.estado) params.estado = filtros.estado;

  if (filtros?.capacidadMin != null) params.capacidadMin = filtros.capacidadMin;
  if (filtros?.capacidadMax != null) params.capacidadMax = filtros.capacidadMax;

  const { data } = await api.get('/espacios', { params });
  return data;
}

export async function getEspacioById(id: string): Promise<Espacio> {
  const { data } = await api.get(`/espacios/${id}`);
  return data;
}

export async function createEspacio(data: Espacio): Promise<Espacio> {
  const { data: created } = await api.post('/espacios', data);
  return created;
}

export async function updateEspacio(id: string, data: Partial<Espacio>): Promise<Espacio> {
  const { data: updated } = await api.put(`/espacios/${id}`, data);
  return updated;
}

export async function deleteEspacio(id: string): Promise<void> {
  await api.delete(`/espacios/${id}`);
}
