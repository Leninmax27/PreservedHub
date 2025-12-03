import api from './api';
import type { Facultad } from './facultades.service';
import type { Carrera } from './carreras.service';

export interface Materia {
  _id: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
  facultad: string | Facultad;
  carrera: string | Carrera;
  creditos?: number;
  semestre?: number;
  estado: 'ACTIVA' | 'INACTIVA';
  createdAt?: string;
  updatedAt?: string;
}

export interface CrearMateriaDTO {
  nombre: string;
  codigo: string;
  facultad: string; // id facultad
  carrera: string;  // id carrera
  descripcion?: string;
  creditos?: number;
  semestre?: number;
}

export interface ActualizarMateriaDTO {
  nombre?: string;
  codigo?: string;
  facultad?: string;
  carrera?: string;
  descripcion?: string;
  creditos?: number;
  semestre?: number;
  estado?: 'ACTIVA' | 'INACTIVA';
}

// Listar todas las materias (admin ve todo)
export const listarMaterias = async (): Promise<Materia[]> => {
  const { data } = await api.get<Materia[]>('/materias');
  return data;
};

// Crear materia
export const crearMateria = async (
  payload: CrearMateriaDTO
): Promise<Materia> => {
  const { data } = await api.post<Materia>('/materias', payload);
  return data;
};

// Actualizar materia
export const actualizarMateria = async (
  id: string,
  payload: ActualizarMateriaDTO
): Promise<Materia> => {
  const { data } = await api.put<Materia>(`/materias/${id}`, payload);
  return data;
};

// Cambiar estado
export const cambiarEstadoMateria = async (
  id: string,
  estado: 'ACTIVA' | 'INACTIVA'
): Promise<Materia> => {
  const { data } = await api.patch<Materia>(
    `/materias/${id}/estado`,
    { estado }
  );
  return data;
};