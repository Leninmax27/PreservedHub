import api from './api';

export interface Recurso {
  _id?: string;
  nombre: string;
  tipo: string;
  codigoInventario?: string;
  descripcion?: string;
  facultad: string;      // obligatorio
  espacio?: string|null; // opcional
  cantidad: number;
  estado: string;
}

export interface FiltroRecursos {
  facultad?: string;
  espacio?: string;
  tipo?: string;
  estado?: string;
}

export async function getRecursos(filtros?: FiltroRecursos) {
  const { data } = await api.get('/recursos', { params: filtros });
  return data;
}

export async function getRecursoById(id: string) {
  const { data } = await api.get(`/recursos/${id}`);
  return data;
}

export async function crearRecurso(data: Recurso) {
  const { data: created } = await api.post('/recursos', data);
  return created;
}

export async function actualizarRecurso(id: string, data: Partial<Recurso>) {
  const { data: updated } = await api.put(`/recursos/${id}`, data);
  return updated;
}

export async function eliminarRecurso(id: string) {
  return api.delete(`/recursos/${id}`);
}
