import api from './api';
import type { Facultad } from './facultades.service';

export interface Carrera {
  _id: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
  facultad: string | Facultad;
  estado: 'ACTIVA' | 'INACTIVA';
  createdAt?: string;
  updatedAt?: string;
}

export interface CrearCarreraDTO {
  nombre: string;
  codigo: string;
  facultad: string; // id de facultad
  descripcion?: string;
}

export interface ActualizarCarreraDTO {
  nombre?: string;
  codigo?: string;
  facultad?: string;
  descripcion?: string;
  estado?: 'ACTIVA' | 'INACTIVA';
}

// Listar todas las carreras (admin ve todo)
export const listarCarreras = async (): Promise<Carrera[]> => {
  const { data } = await api.get<Carrera[]>('/carreras');
  return data;
};

// Crear carrera
export const crearCarrera = async (
  payload: CrearCarreraDTO
): Promise<Carrera> => {
  const { data } = await api.post<Carrera>('/carreras', payload);
  return data;
};

// Actualizar carrera
export const actualizarCarrera = async (
  id: string,
  payload: ActualizarCarreraDTO
): Promise<Carrera> => {
  const { data } = await api.put<Carrera>(`/carreras/${id}`, payload);
  return data;
};

// Cambiar estado
export const cambiarEstadoCarrera = async (
  id: string,
  estado: 'ACTIVA' | 'INACTIVA'
): Promise<Carrera> => {
  const { data } = await api.patch<Carrera>(
    `/carreras/${id}/estado`,
    { estado }
  );
  return data;
};